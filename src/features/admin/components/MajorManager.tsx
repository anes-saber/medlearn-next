"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { validateMajorName } from "@/features/admin/types/admin-forms";
import { createMajor, updateMajor, type MajorRow } from "@/features/admin/services/admin";
import type { DeleteTarget } from "../hooks/useAdminData";

interface MajorManagerProps {
  majors: MajorRow[];
  setMajors: React.Dispatch<React.SetStateAction<MajorRow[]>>;
  busy: boolean;
  runMutation: (key: string, action: () => Promise<void>) => void;
  setError: (err: string | null) => void;
  setNotice: (n: { tone: "success" | "error"; text: string } | null) => void;
  setDeleteTarget: (t: DeleteTarget | null) => void;
  moveMajor: (row: MajorRow, direction: "up" | "down") => void;
}

export function MajorManager({
  majors,
  setMajors,
  busy,
  runMutation,
  setError,
  setNotice,
  setDeleteTarget,
  moveMajor,
}: MajorManagerProps) {
  const { t } = useLanguage();
  const [majorForm, setMajorForm] = useState({ name: "", order: 0 });
  const [editingMajor, setEditingMajor] = useState<string | null>(null);

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">{t("admin.majors")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("admin.helper.order")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_100px_auto] sm:items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.name")}</label>
          <Input
            value={majorForm.name}
            onChange={(e) => setMajorForm((s) => ({ ...s, name: e.target.value }))}
            disabled={busy}
            maxLength={200}
            placeholder={t("admin.name")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.order")}</label>
          <Input
            type="number"
            value={majorForm.order}
            onChange={(e) => setMajorForm((s) => ({ ...s, order: Number(e.target.value) || 0 }))}
            disabled={busy}
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            const err = validateMajorName(majorForm.name);
            if (err) {
              setError(t(err));
              return;
            }
            void runMutation("major-create", async () => {
              await createMajor(majorForm.name.trim(), majorForm.order);
              setMajorForm({ name: "", order: 0 });
              setNotice({ tone: "success", text: t("admin.save") });
            });
          }}
          disabled={busy || !majorForm.name.trim()}
        >
          {t("admin.add")}
        </Button>
      </div>

      {majors.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {t("empty.admin.majors")}
        </p>
      ) : (
        <div className="space-y-3">
          {[...majors]
            .sort((a, b) => a.order - b.order)
            .map((major) => {
              const isEdit = editingMajor === major.id;
              return (
                <div
                  key={major.id}
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_100px_1fr]"
                >
                  <Input
                    value={major.name}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setMajors((rows) => rows.map((r) => (r.id === major.id ? { ...r, name: e.target.value } : r)))
                    }
                  />
                  <Input
                    type="number"
                    value={major.order}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setMajors((rows) =>
                        rows.map((r) => (r.id === major.id ? { ...r, order: Number(e.target.value) || 0 } : r)),
                      )
                    }
                  />
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => moveMajor(major, "up")}
                      title={t("admin.helper.reorder")}
                    >
                      Up
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => moveMajor(major, "down")}
                    >
                      Down
                    </Button>
                    {isEdit ? (
                      <Button
                        size="sm"
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const err = validateMajorName(major.name);
                          if (err) {
                            setError(t(err));
                            return;
                          }
                          void runMutation(`major-update-${major.id}`, async () => {
                            await updateMajor(major.id, { name: major.name.trim(), order: major.order });
                            setEditingMajor(null);
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
                        onClick={() => setEditingMajor(major.id)}
                      >
                        {t("admin.edit")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      type="button"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setDeleteTarget({ kind: "major", id: major.id, label: major.name })}
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
