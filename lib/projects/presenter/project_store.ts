'use client';

import { create } from 'zustand';
import { setActiveProjectId } from '@/lib/gantt-chart/repository/project_scope';
import { projectRepository } from '../repository';
import { Project } from '../usecase/types';
import { CreateProjectUsecase } from '../usecase/create_project_usecase';
import { RenameProjectUsecase } from '../usecase/rename_project_usecase';
import { DeleteProjectUsecase } from '../usecase/delete_project_usecase';
import { ReorderProjectsUsecase } from '../usecase/reorder_projects_usecase';
import { GetProjectsUsecase } from '../usecase/get_projects_usecase';

const getProjectsUsecase = new GetProjectsUsecase(projectRepository);
const createProjectUsecase = new CreateProjectUsecase(projectRepository);
const renameProjectUsecase = new RenameProjectUsecase(projectRepository);
const deleteProjectUsecase = new DeleteProjectUsecase(projectRepository);
const reorderProjectsUsecase = new ReorderProjectsUsecase(projectRepository);

interface ProjectStoreState {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  createProject: (name?: string) => Promise<Project | null>;
  renameProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (activeId: string, overId: string) => Promise<void>;
  setActiveProject: (projectId: string | null) => void;
  getActiveProject: () => Project | null;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await getProjectsUsecase.execute();
      const currentActive = get().activeProjectId;
      const nextActive =
        currentActive && projects.some((p) => p.id === currentActive)
          ? currentActive
          : projects[0]?.id ?? null;

      if (nextActive) {
        setActiveProjectId(nextActive);
      }

      set({ projects, activeProjectId: nextActive, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load projects',
        isLoading: false
      });
    }
  },

  createProject: async (name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const projects = get().projects;
      const fallbackName = `Project ${projects.length + 1}`;
      const project = await createProjectUsecase.execute(name?.trim() || fallbackName);

      const updated = [...projects, project].sort((a, b) => a.order - b.order);
      setActiveProjectId(project.id);

      set({
        projects: updated,
        activeProjectId: project.id,
        isLoading: false
      });

      return project;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false
      });
      return null;
    }
  },

  renameProject: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await renameProjectUsecase.execute(id, name);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to rename project',
        isLoading: false
      });
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProjectUsecase.execute(id);
      const remaining = get().projects.filter((p) => p.id !== id);

      if (remaining.length === 0) {
        const refreshed = await getProjectsUsecase.execute();
        const fallbackActive = refreshed[0]?.id ?? null;

        if (fallbackActive !== get().activeProjectId) {
          setActiveProjectId(fallbackActive);
        }

        set({
          projects: refreshed,
          activeProjectId: fallbackActive,
          isLoading: false
        });
        return;
      }

      const nextActive = get().activeProjectId === id ? remaining[0]?.id ?? null : get().activeProjectId;

      if (nextActive !== get().activeProjectId) {
        setActiveProjectId(nextActive);
      }

      set({
        projects: remaining.map((project, idx) => ({ ...project, order: idx })),
        activeProjectId: nextActive,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false
      });
    }
  },

  reorderProjects: async (activeId: string, overId: string) => {
    const projects = get().projects;
    const fromIndex = projects.findIndex((p) => p.id === activeId);
    const toIndex = projects.findIndex((p) => p.id === overId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    const reordered = [...projects];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const timestamp = new Date().toISOString();
    const normalized = reordered.map((project, idx) => ({
      ...project,
      order: idx,
      updatedAt: timestamp
    }));

    set({ projects: normalized });

    try {
      await reorderProjectsUsecase.execute(normalized);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reorder projects'
      });
    }
  },

  setActiveProject: (projectId: string | null) => {
    setActiveProjectId(projectId);
    set({ activeProjectId: projectId });
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) ?? null;
  },

  clearError: () => set({ error: null })
}));
