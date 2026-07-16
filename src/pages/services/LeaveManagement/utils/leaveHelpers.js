/* ─────────────────────────────────────────────
   leaveHelpers.js — pure utility functions
───────────────────────────────────────────── */

export const STATUS_COLOR = {
  accepted: "mod-badge-green",
  rejected: "mod-badge-red",
  pending:  "mod-badge-yellow",
};

export const STATUS_ICON = {
  Accepted: "bx-check-circle",
  Rejected: "bx-x-circle",
  Pending:  "bx-time-five",
};

export const EMPTY_FORM = {
  startDate:   "",
  endDate:     "",
  reason:      "",
  leaveTypeId: "",
  leaveTime:   "Full day",
};

/** Calculate number of leave days from date range + duration type */
export const calcDays = (start, end, leaveTime) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  const total = Math.floor((e - s) / 86400000) + 1;
  return leaveTime === "Half day" ? total / 2 : total;
};

/** Format a date string to "DD Mon YYYY" */
export const fmt = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/** Derive stats object from a leave list */
export const statsOf = (list) => ({
  total:    list.length,
  pending:  list.filter((r) => (r.status || "Pending") === "Pending").length,
  accepted: list.filter((r) => r.status === "Accepted").length,
  rejected: list.filter((r) => r.status === "Rejected").length,
});

/** Filter a leave list by search query (name / reason / type / status) */
export const filterLeaves = (list, search) => {
  if (!search.trim()) return list;
  const q = search.toLowerCase();
  return list.filter((r) => {
    const name   = (r.studentName || r.staffName || r.userName || "").toLowerCase();
    const reason = (r.reason || "").toLowerCase();
    const type   = (r.leaveType || r.leaveTypeName || "").toLowerCase();
    const status = (r.status || "Pending").toLowerCase();
    return name.includes(q) || reason.includes(q) || type.includes(q) || status.includes(q);
  });
};

/** Filter a leave list by status value ("" = all) */
export const filterByStatus = (list, status) => {
  if (!status) return list;
  return list.filter((r) => (r.status || "Pending") === status);
};

/** Get display name from a leave row */
export const getRowName = (row) =>
  row.studentName || row.staffName || row.userName || "—";
