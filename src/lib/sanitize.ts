/**
 * Lightweight input sanitization — no external dependencies.
 *
 * Strips HTML tags, script injection vectors, and dangerous protocols.
 * For server-side rendering of user content, always escape at the template level.
 */

const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /javascript\s*:/gi;
const ON_EVENT_RE = /\bon\w+\s*=/gi;
const DANGEROUS_ATTR_RE = /(?:href|src|action)\s*=\s*["']?\s*(?:javascript|data|vbscript)\s*:/gi;

/** Strip all HTML tags from a string. */
export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, "");
}

/** Remove script injection vectors (javascript: URIs, on* event handlers). */
export function stripScripts(input: string): string {
  return input
    .replace(SCRIPT_RE, "")
    .replace(ON_EVENT_RE, "")
    .replace(DANGEROUS_ATTR_RE, "");
}

/** Full sanitization: strip HTML + scripts + trim. */
export function sanitizeText(input: string): string {
  return stripScripts(stripHtml(input)).trim();
}

/** Truncate to a maximum length (useful for display names, titles). */
export function truncate(input: string, maxLen: number): string {
  if (input.length <= maxLen) return input;
  return input.slice(0, maxLen - 1) + "\u2026";
}

/** Validate that a string looks like a safe language code (xx or xx-xx). */
export function isLanguageCode(input: string): boolean {
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(input.trim());
}

/** Validate UUID format. */
export function isUUID(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
}

/** Validate email format (basic). */
export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/** Max lengths for common fields. */
export const MAX_LENGTHS = {
  name: 200,
  title: 500,
  description: 5000,
  language: 10,
  url: 2048,
  email: 254,
  feedback: 10000,
  content: 50000,
} as const;
