import { ProjectPage } from "@/components/shared/project-page";

interface ProjectIdPage {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectIdPage({ params }: ProjectIdPage) {
  const { projectId } = await params;

  return <ProjectPage projectId={projectId} />;
}
