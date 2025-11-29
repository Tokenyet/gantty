'use client';

import { create } from 'zustand';
import { Group, CreateGroupData, UpdateGroupData } from '../usecase/types';
import { groupRepository } from '../repository';
import { tryGetActiveProjectId } from '../repository/project_scope';

interface GroupStoreState {
  // State
  groups: Group[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadGroups: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<void>;
  updateGroup: (id: string, data: UpdateGroupData) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  toggleGroupVisibility: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStoreState>((set, get) => ({
  // Initial state
  groups: [],
  isLoading: false,
  error: null,

  // Actions
  loadGroups: async () => {
    const projectId = tryGetActiveProjectId();
    if (!projectId) {
      set({ groups: [], isLoading: false, error: 'Please select a project' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const groups = await groupRepository.getAll();
      set({ groups, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGroup: async (data: CreateGroupData) => {
    set({ isLoading: true, error: null });
    try {
      const group = await groupRepository.create(data);
      set((state) => ({
        groups: [...state.groups, group],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateGroup: async (id: string, data: UpdateGroupData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await groupRepository.update(id, data);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g)),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteGroup: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await groupRepository.delete(id);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  toggleGroupVisibility: async (id: string) => {
    const group = get().groups.find((g) => g.id === id);
    if (!group) return;

    try {
      const updated = await groupRepository.setVisibility(id, !group.visible);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g))
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      groups: [],
      isLoading: false,
      error: null
    });
  }
}));
