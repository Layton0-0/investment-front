/**
 * Allowed URL schemes for external links. Only http and https are safe.
 */
const SAFE_SCHEMES = ["http:", "https:"];

/**
 * Returns whether the given string is a safe href for use in <a href="...">.
 * Only http: and https: URLs are allowed.
 */
export function isSafeHref(url: string | null | undefined): boolean {
  if (url == null || typeof url !== "string" || url.trim() === "") {
    return false;
  }
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return SAFE_SCHEMES.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Returns the URL if it is safe for use as href; otherwise returns empty string.
 * Use this when rendering <a href={getSafeHref(url)}> to avoid javascript: or other schemes.
 */
export function getSafeHref(url: string | null | undefined): string {
  return isSafeHref(url) ? url!.trim() : "";
}
