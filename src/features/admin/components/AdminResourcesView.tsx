"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminData } from "@/features/admin/hooks/useAdminData";
import { ResourceManager } from "@/features/admin/components/ResourceManager";
import { Button } from "@/components/ui/button";

export default function AdminResourcesView() {
  const { t } = useLanguage();
  const adminData = useAdminData();

  if (adminData.loading) {
    return <div className="container py-12 text-muted-foreground">{t("admin.loading")}</div>;
  }

  return (
    <div className="admin-page container space-y-8 py-10">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">{t("admin.nav.resources")}</h1>
        {adminData.error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {adminData.error}
          </p>
        )}
        {adminData.notice && (
          <p className={adminData.notice.tone === "success"
            ? "rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
            : "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"}>
            {adminData.notice.text}
          </p>
        )}
      </header>

      {adminData.deleteTarget && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">{t("admin.delete.prompt")}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{adminData.deleteTarget.label}</span>
              {" · "}{t("admin.delete.cannot_undo")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={adminData.busy} onClick={() => adminData.setDeleteTarget(null)}>
              {t("admin.cancel")}
            </Button>
            <Button type="button" variant="destructive" size="sm" disabled={adminData.busy} onClick={() => void adminData.confirmDelete()}>
              {t("admin.delete.confirm_btn")}
            </Button>
          </div>
        </div>
      )}

      <ResourceManager
        resources={adminData.resources}
        setResources={adminData.setResources}
        majors={adminData.majors}
        modules={adminData.modules}
        modulesByMajor={adminData.modulesByMajor}
        busy={adminData.busy}
        busyKey={adminData.busyKey}
        runMutation={adminData.runMutation}
        setError={adminData.setError}
        setNotice={adminData.setNotice}
        setDeleteTarget={adminData.setDeleteTarget}
      />
    </div>
  );
}
