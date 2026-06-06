import MajorsView from "@/features/majors/components/MajorsView";
import { getMajorsOrdered, getModuleCountsByMajor } from "@/features/majors/services/browse";

export default async function StudentCoursesPage() {
  const [majors, moduleCounts] = await Promise.all([
    getMajorsOrdered(),
    getModuleCountsByMajor(),
  ]);

  return <MajorsView majors={majors} moduleCounts={moduleCounts} basePath="/dashboard/courses" />;
}
