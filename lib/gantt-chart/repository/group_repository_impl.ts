import { GroupRepository } from '../usecase/group_repository';
import { Group, CreateGroupData, UpdateGroupData } from '../usecase/types';
import { StorageService } from './storage_service';
import { NotFoundError, ValidationError, BusinessRuleViolationError } from '../usecase/errors';
import { validateNonEmpty, validateHexColor, validateLength } from '@/lib/shared/utils/validation';
import { getProjectScopedKey, GROUPS_BASE_KEY } from './project_scope';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface StoredGroups {
  version: string;
  lastUpdated: string;
  data: Group[];
}

export const DEFAULT_GROUPS: Group[] = [
  { id: 'group-frontend', name: 'Frontend', color: '#3B82F6', visible: true, order: 0, isDefault: true },
  { id: 'group-backend', name: 'Backend', color: '#10B981', visible: true, order: 1, isDefault: true },
  { id: 'group-design', name: 'Design', color: '#F59E0B', visible: true, order: 2, isDefault: true }
];

export class GroupRepositoryImpl implements GroupRepository {
  constructor(
    private storage: StorageService,
    private hasEventsInGroup: (groupId: string) => Promise<boolean> // Check if group has events
  ) {}

  async getAll(): Promise<Group[]> {
    const stored = await this.storage.get<StoredGroups>(this.getStorageKey());
    
    // If no groups exist, initialize with defaults
    if (!stored || !stored.data || stored.data.length === 0) {
      await this.initializeDefaults();
      const newStored = await this.storage.get<StoredGroups>(this.getStorageKey());
      return newStored?.data || [];
    }
    
    return stored.data;
  }

  async getById(id: string): Promise<Group | null> {
    const groups = await this.getAll();
    return groups.find(g => g.id === id) || null;
  }

  async create(data: CreateGroupData): Promise<Group> {
    // Validate input
    validateNonEmpty(data.name, 'name');
    validateLength(data.name, 'name', 1, 50);
    validateHexColor(data.color);

    const groups = await this.getAll();

    // Check name uniqueness
    const nameExists = groups.some(g => g.name.toLowerCase() === data.name.toLowerCase());
    if (nameExists) {
      throw new ValidationError(
        `Group with name "${data.name}" already exists`,
        'name',
        'unique'
      );
    }

    const group: Group = {
      id: generateUUID(),
      name: data.name.trim(),
      color: data.color.toUpperCase(),
      visible: true,
      order: data.order ?? groups.length,
      isDefault: false
    };

    groups.push(group);
    await this.saveGroups(groups);

    return group;
  }

  async update(id: string, data: UpdateGroupData): Promise<Group> {
    const groups = await this.getAll();
    const index = groups.findIndex(g => g.id === id);

    if (index === -1) {
      throw new NotFoundError('Group', id);
    }

    const existingGroup = groups[index];
    const updated: Group = { ...existingGroup };

    // Apply updates
    if (data.name !== undefined) {
      validateNonEmpty(data.name, 'name');
      validateLength(data.name, 'name', 1, 50);

      // Check name uniqueness (excluding current group)
      const nameExists = groups.some(
        g => g.id !== id && g.name.toLowerCase() === data.name!.toLowerCase()
      );
      if (nameExists) {
        throw new ValidationError(
          `Group with name "${data.name}" already exists`,
          'name',
          'unique'
        );
      }

      updated.name = data.name.trim();
    }

    if (data.color !== undefined) {
      validateHexColor(data.color);
      updated.color = data.color.toUpperCase();
    }

    if (data.order !== undefined) {
      updated.order = data.order;
    }

    groups[index] = updated;
    await this.saveGroups(groups);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const groups = await this.getAll();
    const group = groups.find(g => g.id === id);

    if (!group) {
      return false;
    }

    // Check if group has events
    const hasEvents = await this.hasEventsInGroup(id);
    if (hasEvents) {
      throw new BusinessRuleViolationError(
        'Cannot delete group with associated events. Please reassign or delete events first.',
        'groupHasEvents'
      );
    }

    const filtered = groups.filter(g => g.id !== id);
    await this.saveGroups(filtered);

    return true;
  }

  async setVisibility(id: string, visible: boolean): Promise<Group> {
    const groups = await this.getAll();
    const index = groups.findIndex(g => g.id === id);

    if (index === -1) {
      throw new NotFoundError('Group', id);
    }

    groups[index].visible = visible;
    await this.saveGroups(groups);

    return groups[index];
  }

  async initializeDefaults(): Promise<Group[]> {
    await this.saveGroups(DEFAULT_GROUPS);
    return DEFAULT_GROUPS;
  }

  async replaceAll(groups: Group[]): Promise<void> {
    const seen = new Set<string>();

    for (const group of groups) {
      if (seen.has(group.id)) {
        throw new ValidationError('Group snapshot contains duplicate ids', 'groups', 'duplicate_id');
      }
      seen.add(group.id);
    }

    await this.saveGroups(groups);
  }

  private async saveGroups(groups: Group[]): Promise<void> {
    const stored: StoredGroups = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      data: groups
    };
    await this.storage.set(this.getStorageKey(), stored);
  }

  private getStorageKey(): string {
    return getProjectScopedKey(GROUPS_BASE_KEY);
  }
}
