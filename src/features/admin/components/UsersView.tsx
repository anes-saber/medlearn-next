"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { type UserRole } from "@/lib/rbac";
import { updateUserRole } from "@/features/admin/actions/users";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const ROLE_OPTIONS: UserRole[] = ["student", "teacher", "admin"];

export default function UsersView({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdating(userId);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      console.error(result.error);
    }
    setUpdating(null);
    router.refresh();
  }

  return (
    <div className="admin-page animate-fade-in p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: "hsla(203,58%,45%,0.15)" }}>
          <Users className="h-5 w-5" style={{ color: "hsl(203,58%,55%)" }} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "hsl(210,20%,90%)" }}>
            Manage Users
          </h1>
          <p className="text-sm" style={{ color: "hsl(215,15%,55%)" }}>
            {profiles.length} user{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: "hsl(220,12%,16%)", background: "hsl(220,14%,9%)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "hsl(220,12%,12%)", borderBottom: "1px solid hsl(220,12%,16%)" }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "hsl(215,15%,45%)" }}>Name</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "hsl(215,15%,45%)" }}>Email</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "hsl(215,15%,45%)" }}>Role</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: "hsl(215,15%,45%)" }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid hsl(220,12%,14%)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "hsl(210,20%,85%)" }}>
                    <div className="flex items-center gap-2">
                      {p.full_name || "—"}
                      {p.id === currentUserId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: "hsla(151,50%,35%,0.15)", color: "hsl(151,50%,55%)" }}>
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "hsl(215,15%,60%)" }}>{p.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.role}
                      disabled={updating === p.id}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                      className="rounded-lg border px-2.5 py-1.5 text-xs font-medium appearance-none cursor-pointer transition-colors disabled:opacity-50"
                      style={{
                        background: "hsl(220,12%,14%)",
                        borderColor: "hsl(220,12%,22%)",
                        color: p.role === "admin" ? "hsl(151,50%,55%)"
                          : p.role === "teacher" ? "hsl(210,80%,60%)"
                          : "hsl(215,15%,65%)",
                      }}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "hsl(215,15%,45%)" }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
