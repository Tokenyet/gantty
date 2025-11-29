'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/projects/project_store';
import { Project } from '@/lib/projects/types';

export default function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-slate-300">
            Create separate Gantt boards for each project. Reorder projects to keep the important ones on top.
          </p>
        </header>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/60 shadow-inner"
            />
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:opacity-60"
            >
              Create project
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-100 border border-rose-400/30">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-xs font-semibold uppercase tracking-wide text-rose-200 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
            <span>Projects</span>
            <span>Update by reordering</span>
          </div>

          <div className="mt-3 grid gap-3">
            {orderedProjects.map((project, index) => {
              const isActive = project.id === activeProjectId;
              return (
                <div
                  key={project.id}
                  className={`group flex items-center gap-4 rounded-xl border px-4 py-3 shadow-md transition ${
                    isActive
                      ? 'border-sky-400/60 bg-sky-500/5 shadow-sky-500/20'
                      : 'border-white/5 bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                        #{index + 1}
                      </span>
                      <p className="text-lg font-semibold text-white">{project.name}</p>
                      {isActive && (
                        <span className="rounded-full bg-sky-500/20 px-2 py-1 text-[11px] font-semibold text-sky-100">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      Updated {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveProject(project.id, 'up')}
                      disabled={index === 0}
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:border-sky-400/50 hover:text-sky-100 disabled:opacity-40"
                      title="Move up"
                    >
                      ^
                    </button>
                    <button
                      onClick={() => moveProject(project.id, 'down')}
                      disabled={index === orderedProjects.length - 1}
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:border-sky-400/50 hover:text-sky-100 disabled:opacity-40"
                      title="Move down"
                    >
                      v
                    </button>
                    <button
                      onClick={() => handleOpen(project.id)}
                      className="rounded-lg bg-white text-slate-900 px-3 py-1.5 text-xs font-semibold shadow transition hover:bg-slate-100"
                    >
                      Open Gantt
                    </button>
                    <button
                      onClick={() => handleRename(project)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-sky-400/50"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {!isLoading && orderedProjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/20 px-4 py-8 text-center text-slate-200">
                No projects yet. Create one to start a Gantt board.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
