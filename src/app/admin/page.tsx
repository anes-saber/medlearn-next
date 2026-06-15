import AdminDashboard from "@/features/admin/components/AdminDashboard";
import { getAdminStats } from "@/features/admin/services/getAdminStats";

export default async function AdminPage() {
  const stats = await getAdminStats();
  return <AdminDashboard initialStats={stats} />;
}
