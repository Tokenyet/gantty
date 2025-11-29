import ProjectGanttPageView from '@/lib/gantt-chart/ui/project-gantt-page';

interface ProjectGanttPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectGanttPage({ params }: ProjectGanttPageProps) {
  return <ProjectGanttPageView projectId={params.projectId} />;
}
