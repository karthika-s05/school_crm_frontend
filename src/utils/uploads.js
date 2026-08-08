import { API_BASE_URLS } from "../services/api";

const ADMIN_BASE = String(API_BASE_URLS.ADMIN_URL || "").replace(/\/$/, "");

/** Placeholder / default avatar — not a real upload. */
export const isPlaceholderImage = (url) => {
  const value = String(url || "").toLowerCase();
  return (
    !value.trim() ||
    value.includes("noimage") ||
    value.includes("men2.jpg") ||
    value.includes("nophoto")
  );
};

/**
 * Rebuild stored upload URLs against the current Admin service.
 * Rewrites broken LAN / :1010 hosts; keeps other absolute http(s) URLs
 * so certificates still open from the original upload server.
 */
export const resolveUploadUrl = (url) => {
  if (isPlaceholderImage(url)) return "";
  const raw = String(url).trim().replace(/\\/g, "/");
  const uploadsIdx = raw.toLowerCase().indexOf("/uploads/");
  if (uploadsIdx >= 0) {
    const pathPart = raw.slice(uploadsIdx);
    const isBrokenHost =
      /localhost/i.test(raw) ||
      /127\.0\.0\.1/.test(raw) ||
      /192\.168\.\d+\.\d+/.test(raw) ||
      /10\.\d+\.\d+\.\d+/.test(raw) ||
      /:1010\b/.test(raw);
    if (ADMIN_BASE && (isBrokenHost || !/^https?:\/\//i.test(raw))) {
      return `${ADMIN_BASE}${pathPart}`;
    }
    if (/^https?:\/\//i.test(raw)) return raw;
    return ADMIN_BASE ? `${ADMIN_BASE}${pathPart}` : raw;
  }
  if (raw.startsWith("uploads/")) {
    return `${ADMIN_BASE}/${raw}`;
  }
  // Relative filename only — assume student photo folder
  if (!/^https?:\/\//i.test(raw) && raw.includes(".")) {
    return `${ADMIN_BASE}/uploads/student/${raw.replace(/^\/+/, "")}`;
  }
  return raw;
};

/** First non-empty value among the given keys of a record. */
export const pickDocUrl = (row, ...keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value != null && String(value).trim()) return value;
  }
  return "";
};

export const fileNameFromUrl = (url, fallback = "document") => {
  if (!url || typeof url !== "string") return fallback;
  try {
    const clean = url.split("?")[0];
    const name = decodeURIComponent(clean.split("/").pop() || "");
    return name || fallback;
  } catch {
    return fallback;
  }
};
