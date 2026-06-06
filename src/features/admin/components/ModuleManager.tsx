"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { validateModuleName } from "@/features/admin/types/admin-forms";
import { createModule, updateModule, type MajorRow, type ModuleRow } from "@/features/admin/services/admin";
import type { DeleteTarget } from "../hooks/useAdminData";

interface ModuleManagerProps {
  modules: ModuleRow[];
  setModules: React.Dispatch<React.SetStateAction<ModuleRow[]>>;
  majors: MajorRow[];
  busy: boolean;
  runMutation: (key: string, action: () => Promise<void>) => void;
  setError: (err: string | null) => void;
  setNotice: (n: { tone: "success" | "error"; text: string } | null) => void;
  setDeleteTarget: (t: DeleteTarget | null) => void;
  moveModule: (row: ModuleRow, direction: "up" | "down") => void;
}

export function ModuleManager({
  modules,
  setModules,
  majors,
  busy,
  runMutation,
  setError,
  setNotice,
  setDeleteTarget,
  moveModule,
}: ModuleManagerProps) {
  const { t } = useLanguage();
  const [moduleForm, setModuleForm] = useState({ major_id: majors[0]?.id ?? "", name: "", order: 0 });
  const [editingModule, setEditingModule] = useState<string | null>(null);

  // Sync initial major if not set
  if (!moduleForm.major_id && majors[0]) {
    setModuleForm((prev) => ({ ...prev, major_id: majors[0].id }));
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">{t("admin.modules")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("admin.helper.select_major")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.major")}</label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={moduleForm.major_id}
            onChange={(e) => setModuleForm((s) => ({ ...s, major_id: e.target.value }))}
            disabled={busy || majors.length === 0}
          >
            {majors.length === 0 ? <option value="">{t("empty.admin.majors")}</option> : null}
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.name")}</label>
          <Input
            value={moduleForm.name}
            onChange={(e) => setModuleForm((s) => ({ ...s, name: e.target.value }))}
            disabled={busy}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.order")}</label>
          <Input
            type="number"
            value={moduleForm.order}
            onChange={(e) => setModuleForm((s) => ({ ...s, order: Number(e.target.value) || 0 }))}
            disabled={busy}
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            const err = validateModuleName(moduleForm.name);
            if (err) {
              setError(t(err));
              return;
            }
            if (!moduleForm.major_id) {
              setError(t("validation.major_module"));
              return;
            }
            void runMutation("module-create", async () => {
              await createModule({
                major_id: moduleForm.major_id,
                name: moduleForm.name.trim(),
                order: moduleForm.order,
              });
              setModuleForm((s) => ({ ...s, name: "", order: 0 }));
              setNotice({ tone: "success", text: t("admin.save") });
            });
          }}
          disabled={busy || !moduleForm.name.trim() || !moduleForm.major_id || majors.length === 0}
        >
          {t("admin.add")}
        </Button>
      </div>

      {modules.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {t("empty.admin.modules")}
        </p>
      ) : (
        <div className="space-y-3">
          {[...modules]
            .sort((a, b) => a.order - b.order)
            .map((mod) => {
              const isEdit = editingModule === mod.id;
              return (
                <div
                  key={mod.id}
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_1fr_100px_1fr]"
                >
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={mod.major_id}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setModules((rows) => rows.map((r) => (r.id === mod.id ? { ...r, major_id: e.target.value } : r)))
                    }
                  >
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={mod.name}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setModules((rows) => rows.map((r) => (r.id === mod.id ? { ...r, name: e.target.value } : r)))
                    }
                  />
                  <Input
                    type="number"
                    value={mod.order}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setModules((rows) =>
                        rows.map((r) => (r.id === mod.id ? { ...r, order: Number(e.target.value) || 0 } : r)),
                      )
                    }
                  />
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button size="sm" type="button" variant="outline" disabled={busy} onClick={() => moveModule(mod, "up")}>
                      Up
                    </Button>
                    <Button size="sm" type="button" variant="outline" disabled={busy} onClick={() => moveModule(mod, "down")}>
                      Down
                    </Button>
                    {isEdit ? (
                      <Button
                        size="sm"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const err = validateModuleName(mod.name);
                          if (err) {
                            setError(t(err));
                            return;
                          }
                          void runMutation(`module-update-${mod.id}`, async () => {
                            await updateModule(mod.id, {
                              major_id: mod.major_id,
                              name: mod.name.trim(),
                              order: mod.order,
                            });
                            setEditingModule(null);
                            setNotice({ tone: "success", text: t("admin.save") });
                          });
                        }}
                      >
                        {t("admin.save")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => setEditingModule(mod.id)}
                      >
                        {t("admin.edit")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      type="button"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setDeleteTarget({ kind: "module", id: mod.id, label: mod.name })}
                    >
                      {t("admin.delete")}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}
