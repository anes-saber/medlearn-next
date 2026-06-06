export const revalidate = 60;

import { notFound } from "next/navigation";

import ModuleTabsView from "@/features/majors/components/ModuleTabsView";
import {
  getModuleById,
  getPublishedResourcesForModule,
  getPublishedQuizzesForModule,
  getPublishedHomeworksForModule,
} from "@/features/majors/services/browse";

type PageProps = {
  params: Promise<{ majorId: string; moduleId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ModuleResourcesPage({ params, searchParams }: PageProps) {
  const { majorId, moduleId } = await params;
  const { tab } = await searchParams;

  const mod = await getModuleById(moduleId);
  if (!mod || mod.major_id !== majorId) {
    notFound();
  }

  const [resources, quizzes, homeworks] = await Promise.all([
    getPublishedResourcesForModule(majorId, moduleId),
    getPublishedQuizzesForModule(majorId, moduleId),
    getPublishedHomeworksForModule(majorId, moduleId),
  ]);

  return (
    <ModuleTabsView
      module={mod}
      majorId={majorId}
      resources={resources}
      quizzes={quizzes}
      homeworks={homeworks}
      initialTab={(tab === "quizzes" || tab === "homework") ? tab : "resources"}
    />
  );
}
