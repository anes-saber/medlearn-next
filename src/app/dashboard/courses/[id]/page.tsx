import { notFound } from "next/navigation";

import MajorDetailView from "@/features/majors/components/MajorDetailView";
import {
  getMajorById,
  getModulesForMajor,
  getResourceCountsByModuleForMajor,
} from "@/features/majors/services/browse";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentMajorDetailPage({ params }: PageProps) {
  const { id } = await params;

  const major = await getMajorById(id);
  if (!major) {
    notFound();
  }

  const [modules, resourceCounts] = await Promise.all([
    getModulesForMajor(id),
    getResourceCountsByModuleForMajor(id),
  ]);

  return (
    <MajorDetailView
      majorId={id}
      major={major}
      modules={modules}
      resourceCounts={resourceCounts}
      basePath="/dashboard/courses"
    />
  );
}
