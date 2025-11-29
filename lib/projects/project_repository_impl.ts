import { ProjectRepository } from './project_repository';
import { Project } from './types';
import { StorageService } from '@/lib/gantt-chart/repository/storage_service';
import {
  EVENTS_BASE_KEY,
  getProjectScopedKey,
  GROUPS_BASE_KEY,
  VERSION_METADATA_BASE_KEY,
  VERSIONS_BASE_KEY
} from '@/lib/gantt-chart/repository/project_scope';
import { NotFoundError, ValidationError } from '@/lib/gantt-chart/usecase/errors';
import { validateLength, validateNonEmpty } from '@/lib/shared/utils/validation';

const PROJECTS_KEY = 'projects_v1';
const DEFAULT_PROJECT_NAME = 'My First Project';

interface StoredProjects {
  version: string;
  lastUpdated: string;
  data: Project[];
}

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(private storage: StorageService) {}

  async getAll(): Promise<Project[]> {
    const stored = await this.storage.get<StoredProjects>(PROJECTS_KEY);
    if (!stored || !stored.data || stored.data.length === 0) {
      return this.initializeDefault();
    }

    return [...stored.data].sort((a, b) => a.order - b.order);
  }

  async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll();
    return projects.find((p) => p.id === id) ?? null;
  }

  async create(name: string): Promise<Project> {
    validateNonEmpty(name, 'name');
    validateLength(name, 'name', 1, 80);

    const projects = await this.getAll();
    const trimmedName = name.trim();

    this.ensureUniqueName(projects, trimmedName);

    const now = new Date().toISOString();
    const project: Project = {
      id: generateUUID(),
      name: trimmedName,
      order: projects.length,
      createdAt: now,
      updatedAt: now
    };

    projects.push(project);
    await this.saveProjects(projects);
    return project;
  }

  async rename(id: string, name: string): Promise<Project> {
    validateNonEmpty(name, 'name');
    validateLength(name, 'name', 1, 80);

    const projects = await this.getAll();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundError('Project', id);
    }

    const trimmedName = name.trim();
    this.ensureUniqueName(projects.filter((p) => p.id !== id), trimmedName);

    const updated: Project = {
      ...projects[index],
      name: trimmedName,
      updatedAt: new Date().toISOString()
    };

    projects[index] = updated;
    await this.saveProjects(projects);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const projects = await this.getAll();
    const filtered = projects.filter((p) => p.id !== id);

    if (filtered.length === projects.length) {
      return false;
    }

    const reOrdered = filtered.map((project, idx) => ({
      ...project,
      order: idx,
      updatedAt: new Date().toISOString()
    }));

    await this.saveProjects(reOrdered);
    await this.cleanupProjectData(id);
    return true;
  }

  async reorder(ordered: Project[]): Promise<void> {
    const existing = await this.getAll();

    if (existing.length !== ordered.length) {
      throw new ValidationError('Project order payload is invalid', 'order', 'length_mismatch');
    }

    const existingIds = new Set(existing.map((p) => p.id));
    const seen = new Set<string>();

    for (const project of ordered) {
      if (!existingIds.has(project.id) || seen.has(project.id)) {
        throw new ValidationError('Project order payload is invalid', 'order', 'invalid_id');
      }
      seen.add(project.id);
    }

    const normalized = ordered.map((project, idx) => ({
      ...project,
      order: idx,
      updatedAt: new Date().toISOString()
    }));

    await this.saveProjects(normalized);
  }

  private async initializeDefault(): Promise<Project[]> {
    const now = new Date().toISOString();
    const defaultProject: Project = {
      id: generateUUID(),
      name: DEFAULT_PROJECT_NAME,
      order: 0,
      createdAt: now,
      updatedAt: now
    };
    await this.saveProjects([defaultProject]);
    return [defaultProject];
  }

  private async saveProjects(projects: Project[]): Promise<void> {
    const stored: StoredProjects = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      data: projects
    };
    await this.storage.set(PROJECTS_KEY, stored);
  }

  private async cleanupProjectData(projectId: string): Promise<void> {
    // Best-effort cleanup of data stored under the project namespace
    await Promise.all([
      this.storage.remove(getProjectScopedKey(EVENTS_BASE_KEY, projectId)),
      this.storage.remove(getProjectScopedKey(GROUPS_BASE_KEY, projectId)),
      this.storage.remove(getProjectScopedKey(VERSIONS_BASE_KEY, projectId)),
      this.storage.remove(getProjectScopedKey(VERSION_METADATA_BASE_KEY, projectId))
    ]);
  }

  private ensureUniqueName(projects: Project[], name: string): void {
    const nameExists = projects.some((p) => p.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
      throw new ValidationError(`Project with name "${name}" already exists`, 'name', 'unique');
    }
  }
}
