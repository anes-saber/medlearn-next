import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminData,
  updateMajor,
  updateModule,
  deleteMajor,
  deleteModule,
  deleteResource,
  type MajorRow,
  type ModuleRow,
  type ResourceRow,
} from "@/features/admin/services/admin";

export type DeleteTarget =
  | { kind: "major"; id: string; label: string }
  | { kind: "module"; id: string; label: string }
  | { kind: "resource"; id: string; label: string };

export function useAdminData() {
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const busy = busyKey !== null;

  const modulesByMajor = useMemo(() => {
    return modules.reduce<Record<string, ModuleRow[]>>((acc, mod) => {
      acc[mod.major_id] = [...(acc[mod.major_id] ?? []), mod].sort((a, b) => a.order - b.order);
      return acc;
    }, {});
  }, [modules]);

  async function refreshData() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminData();
      setMajors(data.majors);
      setModules(data.modules);
      setResources(data.resources);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  async function runMutation(key: string, action: () => Promise<void>) {
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      await refreshData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setBusyKey(null);
    }
  }

  function moveMajor(row: MajorRow, direction: "up" | "down") {
    const ordered = [...majors].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((m) => m.id === row.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swap = ordered[swapIndex];
    if (!swap || busy) return;
    void runMutation(`major-move-${row.id}`, async () => {
      await updateMajor(row.id, { name: row.name, order: swap.order });
      await updateMajor(swap.id, { name: swap.name, order: row.order });
    });
  }

  function moveModule(row: ModuleRow, direction: "up" | "down") {
    const ordered = [...modules].filter((m) => m.major_id === row.major_id).sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((m) => m.id === row.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swap = ordered[swapIndex];
    if (!swap || busy) return;
    void runMutation(`module-move-${row.id}`, async () => {
      await updateModule(row.id, { major_id: row.major_id, name: row.name, order: swap.order });
      await updateModule(swap.id, { major_id: swap.major_id, name: swap.name, order: row.order });
    });
  }

  async function confirmDelete() {
    if (!deleteTarget || busy) return;
    const { kind, id } = deleteTarget;
    setDeleteTarget(null);
    if (kind === "major") {
      await runMutation(`major-delete-${id}`, () => deleteMajor(id));
    } else if (kind === "module") {
      await runMutation(`module-delete-${id}`, () => deleteModule(id));
    } else {
      await runMutation(`resource-delete-${id}`, () => deleteResource(id));
    }
  }

  return {
    majors, setMajors,
    modules, setModules,
    modulesByMajor,
    resources, setResources,
    loading, error, setError, notice, setNotice,
    busyKey, busy,
    deleteTarget, setDeleteTarget, confirmDelete,
    runMutation, moveMajor, moveModule, refreshData
  };
}
