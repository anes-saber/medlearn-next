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

const ROLE_OPTIONS: UserRole[] = ["unpaid-student", "paid-student", "admin"];

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
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15">
          <Users className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-card-foreground">
            Manage Users
          </h1>
          <p className="text-sm text-muted-foreground">
            {profiles.length} user{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-card-foreground">
                    <div className="flex items-center gap-2">
                      {p.full_name || "—"}
                      {p.id === currentUserId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-primary/15 text-primary">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.role}
                      disabled={updating === p.id}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium appearance-none cursor-pointer transition-colors disabled:opacity-50 bg-card text-muted-foreground"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70">
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
