import { create } from 'zustand';
import { Version, VersionDiff, VersionSnapshot } from '../usecase/types';
import { SaveVersionUsecase } from '../usecase/save_version_usecase';
import { CompareVersionsUsecase } from '../usecase/compare_versions_usecase';
import { ApplyVersionUsecase } from '../usecase/apply_version_usecase';
import { eventRepository, groupRepository, versionRepository } from '../repository';

const saveVersionUsecase = new SaveVersionUsecase(versionRepository);
const compareVersionsUsecase = new CompareVersionsUsecase(versionRepository);
const applyVersionUsecase = new ApplyVersionUsecase(
  versionRepository,
  eventRepository,
  groupRepository
);

interface VersionStoreState {
  // State
  versions: Version[];
  selectedVersionIds: string[];
  diff: VersionDiff | null;
  isComparing: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadVersions: () => Promise<void>;
  saveVersion: (note: string, snapshot: VersionSnapshot) => Promise<void>;
  selectVersion: (id: string, isSelected: boolean) => void;
  compareSelected: () => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  applyVersion: (id: string) => Promise<VersionSnapshot>;
  clearSelection: () => void;
}

export const useVersionStore = create<VersionStoreState>((set, get) => ({
  // Initial state
  versions: [],
  selectedVersionIds: [],
  diff: null,
  isComparing: false,
  isLoading: false,
  error: null,

  // Actions
  loadVersions: async () => {
    set({ isLoading: true, error: null });
    try {
      const versions = await versionRepository.getAll();
      set({ versions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load versions',
        isLoading: false
      });
    }
  },

  saveVersion: async (note: string, snapshot: VersionSnapshot) => {
    set({ isLoading: true, error: null });
    try {
      const version = await saveVersionUsecase.execute(note, snapshot);
      const versions = await versionRepository.getAll();
      set({ versions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save version',
        isLoading: false
      });
      throw error;
    }
  },

  selectVersion: (id: string, isSelected: boolean) => {
    set((state) => {
      let newSelected = [...state.selectedVersionIds];
      if (isSelected) {
        // Limit to 2 selections for comparison
        if (newSelected.length >= 2) {
          newSelected = [newSelected[1], id];
        } else {
          newSelected.push(id);
        }
      } else {
        newSelected = newSelected.filter(vid => vid !== id);
      }
      return {
        selectedVersionIds: newSelected,
        diff: null, // Clear diff when selection changes
        isComparing: false
      };
    });
  },

  compareSelected: async () => {
    const { selectedVersionIds } = get();
    if (selectedVersionIds.length !== 2) {
      set({ error: 'Please select exactly 2 versions to compare' });
      return;
    }

    set({ isComparing: true, error: null });
    try {
      const diff = await compareVersionsUsecase.execute(
        selectedVersionIds[0],
        selectedVersionIds[1]
      );
      set({ diff, isComparing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to compare versions',
        isComparing: false
      });
    }
  },

  deleteVersion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await versionRepository.delete(id);
      const versions = await versionRepository.getAll();
      set((state) => ({
        versions,
        selectedVersionIds: state.selectedVersionIds.filter(vid => vid !== id),
        diff: null,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete version',
        isLoading: false
      });
    }
  },

  applyVersion: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await applyVersionUsecase.execute(id);
      set({ isLoading: false });
      return snapshot;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to apply version',
        isLoading: false
      });
      throw error;
    }
  },

  clearSelection: () => {
    set({ selectedVersionIds: [], diff: null, isComparing: false });
  }
}));
