import { Group, CreateGroupData, UpdateGroupData } from './types';

/**
 * Repository interface for Group CRUD operations
 */
export interface GroupRepository {
  /**
   * Get all groups
   * @returns Promise resolving to array of all groups
   */
  getAll(): Promise<Group[]>;

  /**
   * Get group by ID
   * @param id - Group ID
   * @returns Promise resolving to group or null if not found
   */
  getById(id: string): Promise<Group | null>;

  /**
   * Create a new group
   * @param data - Group creation data
   * @returns Promise resolving to created group
   * @throws Error if name already exists or color invalid
   */
  create(data: CreateGroupData): Promise<Group>;

  /**
   * Update an existing group
   * @param id - Group ID to update
   * @param data - Partial group data to update
   * @returns Promise resolving to updated group
   * @throws Error if group not found or validation fails
   */
  update(id: string, data: UpdateGroupData): Promise<Group>;

  /**
   * Delete a group
   * @param id - Group ID to delete
   * @returns Promise resolving to true if deleted
   * @throws Error if group has associated events
   */
  delete(id: string): Promise<boolean>;

  /**
   * Update group visibility (for filtering)
   * @param id - Group ID
   * @param visible - Visibility state
   * @returns Promise resolving to updated group
   */
  setVisibility(id: string, visible: boolean): Promise<Group>;

  /**
   * Initialize default groups (Frontend, Backend, Design)
   * @returns Promise resolving to array of default groups
   */
  initializeDefaults(): Promise<Group[]>;

  /**
   * Replace all groups with the provided list (used for version restore)
   */
  replaceAll(groups: Group[]): Promise<void>;
}
