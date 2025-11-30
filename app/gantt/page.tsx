'use client';

import { useSearchParams } from 'next/navigation';
import ProjectGanttPageView from '@/lib/gantt-chart/ui/project-gantt-page';

export default function GanttPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;

  return <ProjectGanttPageView projectId={projectId} />;
}
