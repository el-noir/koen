'use client';

import ProjectDetailPage from '@/features/projects/project-detail/ProjectDetailPage';

export default function ProjectDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectDetailPage params={params} />;
}
