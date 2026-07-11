export const revalidate = 60;

import HomeView from "@/features/majors/components/HomeView";
import { getHomeStats, getMajorsOrdered, getModuleCountsByMajor } from "@/features/majors/services/browse";

export default async function Home() {
  const [majors, stats, moduleCounts] = await Promise.all([
    getMajorsOrdered(), 
    getHomeStats(),
    getModuleCountsByMajor()
  ]);

  return <HomeView majors={majors} stats={stats} moduleCounts={moduleCounts} />;
}
