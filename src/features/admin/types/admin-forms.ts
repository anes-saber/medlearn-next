import type { ModuleRow, ResourcePayload } from "@/features/admin/services/admin";

export function isValidHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** YouTube video IDs are typically 11 chars; allow a practical range. */
export function isValidYoutubeId(raw: string): boolean {
  const v = raw.trim();
  return /^[a-zA-Z0-9_-]{6,32}$/.test(v);
}

export function validateLanguageCode(raw: string): boolean {
  const v = raw.trim();
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(v);
}

export function validateMajorName(name: string): string | null {
  if (!name.trim()) return "validation.major_name";
  return null;
}

export function validateModuleName(name: string): string | null {
  if (!name.trim()) return "validation.module_name";
  return null;
}

export function validateResourceTitle(title: string): string | null {
  if (!title.trim()) return "validation.resource_title";
  return null;
}

export function validateNewResourceFile(
  type: ResourcePayload["type"],
  file: File | null,
): string | null {
  if (type === "file" && !file) return "validation.file_pick";
  return null;
}

export function validateResourceMajorModule(
  majorId: string,
  moduleId: string,
  modules: ModuleRow[],
): string | null {
  if (!majorId || !moduleId) return "validation.major_module";
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod || mod.major_id !== majorId) return "validation.major_module";
  return null;
}

export function validateResourcePayload(
  payload: ResourcePayload,
  modules: ModuleRow[],
): string | null {
  const t = validateResourceTitle(payload.title);
  if (t) return t;

  if (!validateLanguageCode(payload.language)) return "validation.language";

  const mm = validateResourceMajorModule(payload.major_id, payload.module_id, modules);
  if (mm) return mm;

  switch (payload.type) {
    case "file":
      if (!payload.file_url.trim()) return "validation.file_url";
      break;
    case "link":
      if (!isValidHttpUrl(payload.link)) return "validation.url";
      break;
    case "youtube":
      if (!isValidYoutubeId(payload.youtube_id)) return "validation.youtube";
      break;
    case "text":
      if (!payload.content.trim()) return "validation.text";
      break;
    default:
      return "validation.resource_type";
  }

  return null;
}
