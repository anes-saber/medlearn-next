import type { ModuleRow, ResourcePayload } from "@/features/admin/services/admin";

function isValidHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** YouTube video/playlist ID extraction from link or raw ID. */
export function extractYoutubeId(input: string): string | null {
  const clean = input.trim();
  if (!clean) return null;

  // 1. Check if it's already a raw ID (typically 11 for video, 18-64 for playlist)
  if (/^[a-zA-Z0-9_-]{10,64}$/.test(clean)) {
    return clean;
  }

  try {
    const url = new URL(clean);
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }
      if (url.pathname === "/playlist") {
        return url.searchParams.get("list");
      }
      if (url.pathname.startsWith("/embed/")) {
        if (url.pathname === "/embed/videoseries") {
          return url.searchParams.get("list");
        }
        return url.pathname.split("/")[2];
      }
    }
    if (url.hostname === "youtu.be") {
      return url.pathname.substring(1);
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

/** YouTube video and playlist IDs can range from 11 up to 64 chars. */
export function isValidYoutubeId(raw: string): boolean {
  const v = raw.trim();
  return /^[a-zA-Z0-9_-]{6,64}$/.test(v);
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
    case "youtube": {
      const extracted = extractYoutubeId(payload.youtube_id);
      if (!extracted || !isValidYoutubeId(extracted)) return "validation.youtube";
      break;
    }
    case "text":
      if (!payload.content.trim()) return "validation.text";
      break;
    default:
      return "validation.resource_type";
  }

  return null;
}
