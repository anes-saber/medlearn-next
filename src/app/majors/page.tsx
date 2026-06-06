export const revalidate = 60;

import MajorsView from "@/features/majors/components/MajorsView";
import { getMajorsOrdered, getModuleCountsByMajor } from "@/features/majors/services/browse";

export default async function MajorsPage() {
  const [majors, moduleCounts] = await Promise.all([
    getMajorsOrdered(),
    getModuleCountsByMajor(),
  ]);

  return <MajorsView majors={majors} moduleCounts={moduleCounts} />;
}
