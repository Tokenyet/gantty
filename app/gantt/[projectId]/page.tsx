'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GanttChart from '@/lib/gantt-chart/ui/gantt-chart';
import { useEventStore } from '@/lib/gantt-chart/presenter/event_store';
import { useFilterStore } from '@/lib/gantt-chart/presenter/filter_store';
import { useGroupStore } from '@/lib/gantt-chart/presenter/group_store';
import { useVersionStore } from '@/lib/gantt-chart/presenter/version_store';
import { useProjectStore } from '@/lib/projects/project_store';

export default function ProjectGanttPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const [initialized, setInitialized] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const isLoading = useProjectStore((state) => state.isLoading);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const setActiveProject = useProjectStore((state) => state.setActiveProject);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!projectId) {
        setInitialized(true);
        return;
      }

      await loadProjects();
      if (cancelled) return;

      const found = useProjectStore.getState().projects.find((p) => p.id === projectId);
      if (found) {
        setActiveProject(projectId);
        useEventStore.getState().reset();
        useGroupStore.getState().reset();
        useVersionStore.getState().reset();
        useFilterStore.getState().reset();
      }

      setInitialized(true);
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [projectId, loadProjects, setActiveProject]);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800">
        <div className="space-y-4 rounded-2xl bg-white px-8 py-6 shadow-xl">
          <div className="text-lg font-semibold">Missing project id</div>
          <p className="text-sm text-gray-600">Return to the project list to select a project.</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800">
        <div className="rounded-xl bg-white px-6 py-4 text-sm font-medium shadow">
          Loading project...
        </div>
      </div>
    );
  }

  if (initialized && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-800">
        <div className="space-y-4 rounded-2xl bg-white px-8 py-6 shadow-xl">
          <div className="text-lg font-semibold">Project not found</div>
          <p className="text-sm text-gray-600">Return to the project list to create or select another one.</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  return <GanttChart />;
}
