export const revalidate = 60;

import { notFound } from "next/navigation";

import MajorDetailView from "@/features/majors/components/MajorDetailView";
import {
  getMajorById,
  getModulesForMajor,
  getResourceCountsByModuleForMajor,
} from "@/features/majors/services/browse";

type PageProps = {
  params: Promise<{ majorId: string }>;
};

export default async function MajorDetailPage({ params }: PageProps) {
  const { majorId } = await params;

  const major = await getMajorById(majorId);
  if (!major) {
    notFound();
  }

  const [modules, resourceCounts] = await Promise.all([
    getModulesForMajor(majorId),
    getResourceCountsByModuleForMajor(majorId),
  ]);

  return (
    <MajorDetailView
      majorId={majorId}
      major={major}
      modules={modules}
      resourceCounts={resourceCounts}
    />
  );
}
