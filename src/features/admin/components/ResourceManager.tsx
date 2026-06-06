"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  validateResourceMajorModule,
  validateResourcePayload,
  validateResourceTitle,
  validateNewResourceFile,
  validateLanguageCode,
} from "@/features/admin/types/admin-forms";
import {
  createResource,
  updateResource,
  uploadResourceFile,
  type MajorRow,
  type ModuleRow,
  type ResourceRow,
  type ResourcePayload,
} from "@/features/admin/services/admin";
import type { DeleteTarget } from "../hooks/useAdminData";

type ResourceType = ResourcePayload["type"];

interface ResourceManagerProps {
  resources: ResourceRow[];
  setResources: React.Dispatch<React.SetStateAction<ResourceRow[]>>;
  majors: MajorRow[];
  modules: ModuleRow[];
  modulesByMajor: Record<string, ModuleRow[]>;
  busy: boolean;
  busyKey: string | null;
  runMutation: (key: string, action: () => Promise<void>) => void;
  setError: (err: string | null) => void;
  setNotice: (n: { tone: "success" | "error"; text: string } | null) => void;
  setDeleteTarget: (t: DeleteTarget | null) => void;
}

const defaultResourceForm: ResourcePayload = {
  major_id: "",
  module_id: "",
  type: "file",
  title: "",
  description: "",
  language: "en",
  published: false,
  file_url: "",
  link: "",
  youtube_id: "",
  content: "",
};

export function ResourceManager({
  resources,
  setResources,
  majors,
  modules,
  modulesByMajor,
  busy,
  busyKey,
  runMutation,
  setError,
  setNotice,
  setDeleteTarget,
}: ResourceManagerProps) {
  const { t } = useLanguage();
  const [resourceForm, setResourceForm] = useState<ResourcePayload>(defaultResourceForm);
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);

  useEffect(() => {
    setReplacementFile(null);
  }, [editingResource]);

  // Sync initial major if not set
  useEffect(() => {
    if (!resourceForm.major_id && majors.length > 0) {
      const firstMajor = majors[0].id;
      const firstModule = modules.find((m) => m.major_id === firstMajor)?.id ?? "";
      setResourceForm((prev) => ({ ...prev, major_id: firstMajor, module_id: firstModule }));
    }
  }, [majors, modules, resourceForm.major_id]);

  function syncResourceMajor(majorId: string) {
    const firstModuleId = (modulesByMajor[majorId] ?? [])[0]?.id ?? "";
    setResourceForm((prev) => ({ ...prev, major_id: majorId, module_id: firstModuleId }));
  }

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-heading text-xl font-semibold">{t("admin.resources")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("admin.helper.select_major")}</p>
      </div>

      <div className="space-y-3 rounded-md border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.major")}</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={resourceForm.major_id}
              onChange={(e) => syncResourceMajor(e.target.value)}
              disabled={busy || majors.length === 0}
            >
              <option value="">{t("admin.major")}</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.module")}</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={resourceForm.module_id}
              onChange={(e) => setResourceForm((s) => ({ ...s, module_id: e.target.value }))}
              disabled={busy || !resourceForm.major_id}
            >
              <option value="">{t("admin.module")}</option>
              {(modulesByMajor[resourceForm.major_id] ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.type")}</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={resourceForm.type}
              onChange={(e) => {
                const next = e.target.value as ResourceType;
                setNewResourceFile(null);
                setResourceForm((s) => ({
                  ...s,
                  type: next,
                  file_url: "",
                  link: "",
                  youtube_id: "",
                  content: "",
                }));
              }}
              disabled={busy}
            >
              <option value="file">{t("resources.file")}</option>
              <option value="link">{t("resources.link")}</option>
              <option value="youtube">{t("resources.youtube")}</option>
              <option value="text">{t("resources.text")}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.language")}</label>
            <Input
              placeholder="en"
              value={resourceForm.language}
              onChange={(e) => setResourceForm((s) => ({ ...s, language: e.target.value }))}
              disabled={busy}
            />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
            <input
              type="checkbox"
              checked={resourceForm.published}
              onChange={(e) => setResourceForm((s) => ({ ...s, published: e.target.checked }))}
              disabled={busy}
            />
            {t("admin.published")}
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.title_field")}</label>
          <Input
            value={resourceForm.title}
            onChange={(e) => setResourceForm((s) => ({ ...s, title: e.target.value }))}
            disabled={busy}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">{t("admin.description")}</label>
          <Input
            value={resourceForm.description}
            onChange={(e) => setResourceForm((s) => ({ ...s, description: e.target.value }))}
            disabled={busy}
          />
        </div>

        {resourceForm.type === "file" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">{t("admin.file")}</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="new-resource-file"
                type="file"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  setNewResourceFile(e.target.files?.[0] ?? null);
                  setError(null);
                }}
              />
              <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
                <label htmlFor="new-resource-file" className="cursor-pointer">
                  {t("admin.file.choose")}
                </label>
              </Button>
              {newResourceFile ? (
                <span className="text-xs text-muted-foreground">
                  {t("admin.file.selected")}: <span className="text-foreground">{newResourceFile.name}</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{t("admin.file.hint")}</span>
              )}
            </div>
            {busyKey === "resource-create" && (
              <p className="text-xs text-muted-foreground">{t("admin.file.uploading")}</p>
            )}
          </div>
        )}
        {resourceForm.type === "link" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.link")}</label>
            <Input
              value={resourceForm.link}
              onChange={(e) => setResourceForm((s) => ({ ...s, link: e.target.value }))}
              disabled={busy}
            />
          </div>
        )}
        {resourceForm.type === "youtube" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.youtube_id")}</label>
            <Input
              value={resourceForm.youtube_id}
              onChange={(e) => setResourceForm((s) => ({ ...s, youtube_id: e.target.value }))}
              disabled={busy}
            />
          </div>
        )}
        {resourceForm.type === "text" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">{t("admin.content")}</label>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={resourceForm.content}
              onChange={(e) => setResourceForm((s) => ({ ...s, content: e.target.value }))}
              disabled={busy}
            />
          </div>
        )}

        <Button
          type="button"
          onClick={() => {
            const titleErr = validateResourceTitle(resourceForm.title);
            if (titleErr) {
              setError(t(titleErr));
              return;
            }
            if (!validateLanguageCode(resourceForm.language)) {
              setError(t("validation.language"));
              return;
            }
            const mmErr = validateResourceMajorModule(resourceForm.major_id, resourceForm.module_id, modules);
            if (mmErr) {
              setError(t(mmErr));
              return;
            }
            const pickErr = validateNewResourceFile(resourceForm.type, newResourceFile);
            if (pickErr) {
              setError(t(pickErr));
              return;
            }
            if (resourceForm.type !== "file") {
              const preview: ResourcePayload = { ...resourceForm };
              const preErr = validateResourcePayload(preview, modules);
              if (preErr) {
                setError(t(preErr));
                return;
              }
            }
            const resourceTypeAtSubmit = resourceForm.type;
            void runMutation("resource-create", async () => {
              let fileUrl = "";
              if (resourceForm.type === "file") {
                if (!newResourceFile) throw new Error(t("validation.file_pick"));
                try {
                  fileUrl = await uploadResourceFile(newResourceFile);
                } catch (e) {
                  throw new Error(e instanceof Error ? e.message : t("admin.file.fail"));
                }
              }
              const payload: ResourcePayload = {
                ...resourceForm,
                file_url: resourceForm.type === "file" ? fileUrl : "",
              };
              const typeErr = validateResourcePayload(payload, modules);
              if (typeErr) throw new Error(t(typeErr));
              await createResource(payload);
              setNewResourceFile(null);
              setResourceForm((prev) => ({ ...defaultResourceForm, major_id: prev.major_id, module_id: prev.module_id }));
              setNotice({
                tone: "success",
                text: resourceTypeAtSubmit === "file" ? t("admin.file.success") : t("admin.save"),
              });
            });
          }}
          disabled={
            busy || !resourceForm.major_id || !resourceForm.module_id || !resourceForm.title.trim() || majors.length === 0
          }
        >
          {t("admin.add")}
        </Button>
      </div>

      {resources.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {t("empty.admin.resources")}
        </p>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => {
            const isEdit = editingResource === resource.id;
            return (
              <div key={resource.id} className="space-y-2 rounded-md border border-border p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={resource.title}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) => rows.map((r) => (r.id === resource.id ? { ...r, title: e.target.value } : r)))
                    }
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={resource.type}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) =>
                        rows.map((r) =>
                          r.id === resource.id
                            ? {
                                ...r,
                                type: e.target.value,
                                file_url: null,
                                link: null,
                                youtube_id: null,
                                content: null,
                              }
                            : r,
                        ),
                      )
                    }
                  >
                    <option value="file">{t("resources.file")}</option>
                    <option value="link">{t("resources.link")}</option>
                    <option value="youtube">{t("resources.youtube")}</option>
                    <option value="text">{t("resources.text")}</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={resource.major_id}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) =>
                        rows.map((r) =>
                          r.id === resource.id
                            ? {
                                ...r,
                                major_id: e.target.value,
                                module_id: (modulesByMajor[e.target.value] ?? [])[0]?.id ?? "",
                              }
                            : r,
                        ),
                      )
                    }
                  >
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={resource.module_id}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) => rows.map((r) => (r.id === resource.id ? { ...r, module_id: e.target.value } : r)))
                    }
                  >
                    {(modulesByMajor[resource.major_id] ?? []).map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={resource.language}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) => rows.map((r) => (r.id === resource.id ? { ...r, language: e.target.value } : r)))
                    }
                  />
                </div>

                <Input
                  value={resource.description ?? ""}
                  disabled={!isEdit || busy}
                  placeholder={t("admin.description")}
                  onChange={(e) =>
                    setResources((rows) =>
                      rows.map((r) => (r.id === resource.id ? { ...r, description: e.target.value } : r)),
                    )
                  }
                />

                {resource.type === "file" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {t("admin.file.current")}: {(resource.file_url ?? "").slice(0, 80) || "—"}
                    </p>
                    {isEdit && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          id={`replace-${resource.id}`}
                          type="file"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => setReplacementFile(e.target.files?.[0] ?? null)}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
                          <label htmlFor={`replace-${resource.id}`} className="cursor-pointer">
                            {t("admin.file.replace")}
                          </label>
                        </Button>
                        {replacementFile && isEdit && editingResource === resource.id ? (
                          <span className="text-xs text-muted-foreground">{replacementFile.name}</span>
                        ) : null}
                      </div>
                    )}
                    {!isEdit && (
                      <Input value={resource.file_url ?? ""} disabled className="text-xs text-muted-foreground" />
                    )}
                  </div>
                )}
                {resource.type === "link" && (
                  <Input
                    value={resource.link ?? ""}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) => rows.map((r) => (r.id === resource.id ? { ...r, link: e.target.value } : r)))
                    }
                  />
                )}
                {resource.type === "youtube" && (
                  <Input
                    value={resource.youtube_id ?? ""}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) =>
                        rows.map((r) => (r.id === resource.id ? { ...r, youtube_id: e.target.value } : r)),
                      )
                    }
                  />
                )}
                {resource.type === "text" && (
                  <textarea
                    className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={resource.content ?? ""}
                    disabled={!isEdit || busy}
                    onChange={(e) =>
                      setResources((rows) => rows.map((r) => (r.id === resource.id ? { ...r, content: e.target.value } : r)))
                    }
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={resource.published}
                      disabled={!isEdit || busy}
                      onChange={(e) =>
                        setResources((rows) =>
                          rows.map((r) => (r.id === resource.id ? { ...r, published: e.target.checked } : r)),
                        )
                      }
                    />
                    {t("admin.published")}
                  </label>

                  {isEdit ? (
                    <Button
                      size="sm"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const titleErr = validateResourceTitle(resource.title);
                        if (titleErr) {
                          setError(t(titleErr));
                          return;
                        }
                        if (!validateLanguageCode(resource.language)) {
                          setError(t("validation.language"));
                          return;
                        }
                        void runMutation(`resource-update-${resource.id}`, async () => {
                          let fileUrl = resource.file_url ?? "";
                          if (resource.type === "file" && replacementFile && editingResource === resource.id) {
                            try {
                              fileUrl = await uploadResourceFile(replacementFile);
                            } catch (e) {
                              throw new Error(e instanceof Error ? e.message : t("admin.file.fail"));
                            }
                            setReplacementFile(null);
                          }
                          const payload: ResourcePayload = {
                            major_id: resource.major_id,
                            module_id: resource.module_id,
                            type: resource.type as ResourceType,
                            title: resource.title,
                            description: resource.description ?? "",
                            language: resource.language,
                            published: resource.published,
                            file_url: resource.type === "file" ? fileUrl : "",
                            link: resource.link ?? "",
                            youtube_id: resource.youtube_id ?? "",
                            content: resource.content ?? "",
                          };
                          const err = validateResourcePayload(payload, modules);
                          if (err) throw new Error(t(err));
                          await updateResource(resource.id, payload);
                          setEditingResource(null);
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
                      onClick={() => setEditingResource(resource.id)}
                    >
                      {t("admin.edit")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    type="button"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => setDeleteTarget({ kind: "resource", id: resource.id, label: resource.title })}
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
