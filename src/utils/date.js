const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_FIRST = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
const DATE_ONLY_ISO = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
/** MySQL DATETIME with no timezone: treat as local, not UTC. */
const SQL_DATETIME = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/;

const buildLocal = (year, month, day, hour = 0, minute = 0, second = 0) => {
  const parsed = new Date(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(minute), Number(second)
  );
  // Rejects impossible dates such as 31-02, which JS would roll into March.
  return Number.isNaN(parsed.getTime()) || parsed.getMonth() !== Number(month) - 1
    ? null
    : parsed;
};

/**
 * Backend list endpoints format dates as dd-mm-yyyy, which the browser reads as
 * mm-dd-yyyy (so 13-08-2026 becomes an invalid date). Parse the known backend
 * shapes explicitly and fall back to the native parser for ISO timestamps.
 */
export const parseApiDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  const dayFirst = text.match(DAY_FIRST);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    return buildLocal(year, month, day);
  }

  const dateOnly = text.match(DATE_ONLY_ISO);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return buildLocal(year, month, day);
  }

  const sqlDateTime = text.match(SQL_DATETIME);
  if (sqlDateTime) {
    const [, year, month, day, hour, minute, second] = sqlDateTime;
    return buildLocal(year, month, day, hour, minute, second || 0);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** dd Mon yyyy, or the original text when the value cannot be parsed. */
export const formatApiDate = (value, fallback = "TBD") => {
  if (!value) return fallback;
  const date = parseApiDate(value);
  if (!date) return String(value);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
};

/** hh:mm AM/PM */
export const formatApiTime = (value, fallback = "") => {
  if (!value) return fallback;
  const date = parseApiDate(value);
  if (!date) return String(value);
  const hours = date.getHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = String(hours % 12 || 12).padStart(2, "0");
  return `${hour12}:${String(date.getMinutes()).padStart(2, "0")} ${suffix}`;
};

/** dd Mon yyyy, hh:mm AM/PM */
export const formatApiDateTime = (value, fallback = "") => {
  if (!value) return fallback;
  const date = parseApiDate(value);
  if (!date) return String(value);
  return `${formatApiDate(date)}, ${formatApiTime(date)}`;
};

/**
 * "Just now" / "5 min ago" / "Yesterday, 03:32 PM" for the last week,
 * falling back to the full date and time for anything older or in the future.
 */
export const formatRelativeTime = (value, fallback = "") => {
  if (!value) return fallback;
  const date = parseApiDate(value);
  if (!date) return String(value);

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return formatApiDateTime(date);

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.ceil((startOfToday.getTime() - date.getTime()) / 86400000);
  if (days === 1) return `Yesterday, ${formatApiTime(date)}`;
  if (days < 7) return `${days} days ago`;

  return formatApiDateTime(date);
};

export const startOfDay = (value) => {
  const date = value instanceof Date ? new Date(value) : parseApiDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export { MONTH_LABELS };
