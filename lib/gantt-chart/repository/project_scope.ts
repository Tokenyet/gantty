// Helpers for scoping all storage to the currently selected project.

let activeProjectId: string | null = null;

export const EVENTS_BASE_KEY = 'events_v1';
export const GROUPS_BASE_KEY = 'groups_v1';
export const VERSIONS_BASE_KEY = 'versions_v1';
export const VERSION_METADATA_BASE_KEY = 'metadata_v1';

/**
 * Set the active project id for subsequent repository operations.
 */
export function setActiveProjectId(projectId: string | null): void {
  activeProjectId = projectId;
}

/**
 * Get the active project id or throw if none has been set.
 */
export function getActiveProjectId(): string {
  if (!activeProjectId) {
    throw new Error('No active project selected');
  }
  return activeProjectId;
}

/**
 * Get the active project id if present.
 */
export function tryGetActiveProjectId(): string | null {
  return activeProjectId;
}

/**
 * Build a storage key that is namespaced to a specific project.
 * Falls back to the active project when the id is omitted.
 */
export function getProjectScopedKey(baseKey: string, projectId?: string): string {
  const targetProjectId = projectId ?? getActiveProjectId();
  return `project_${targetProjectId}_${baseKey}`;
}
