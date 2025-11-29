'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/projects/presenter/project_store';
import { Project } from '@/lib/projects/usecase/types';
import ProjectsPageView from './projects-page-view';

export default function ProjectsHomePage() {
  const router = useRouter();
  const {
    projects,
    activeProjectId,
    isLoading,
    error,
    loadProjects,
    createProject,
    renameProject,
    deleteProject,
    reorderProjects,
    setActiveProject,
    clearError
  } = useProjectStore();
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const orderedProjects = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order),
    [projects]
  );

  const handleCreate = async () => {
    const name = newProjectName.trim();
    await createProject(name || undefined);
    setNewProjectName('');
  };

  const handleOpen = (projectId: string) => {
    setActiveProject(projectId);
    router.push(`/gantt/${projectId}`);
  };

  const handleRename = (project: Project) => {
    const name = prompt('Rename project', project.name);
    if (name && name.trim() && name.trim() !== project.name) {
      renameProject(project.id, name.trim());
    }
  };

  const handleDelete = (project: Project) => {
    const confirmed = confirm(`Delete project "${project.name}"? This removes its local data.`);
    if (confirmed) {
      deleteProject(project.id);
    }
  };

  const moveProject = (projectId: string, direction: 'up' | 'down') => {
    const currentIndex = orderedProjects.findIndex((p) => p.id === projectId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedProjects.length) return;

    reorderProjects(projectId, orderedProjects[targetIndex].id);
  };

  return (
    <ProjectsPageView
      projects={orderedProjects}
      activeProjectId={activeProjectId}
      newProjectName={newProjectName}
      isLoading={isLoading}
      error={error}
      onNewProjectNameChange={setNewProjectName}
      onCreateProject={handleCreate}
      onClearError={clearError}
      onOpenProject={handleOpen}
      onRenameProject={handleRename}
      onDeleteProject={handleDelete}
      onMoveProject={moveProject}
    />
  );
}
