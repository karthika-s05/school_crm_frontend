/* ─────────────────────────────────────────────
   leaveHelpers.js - pure utility functions
───────────────────────────────────────────── */

export const STATUS_COLOR = {
  accepted: "mod-badge-green",
  rejected: "mod-badge-red",
  pending:  "mod-badge-yellow",
};

export const STATUS_ICON = {
  accepted: "bx-check-circle",
  rejected: "bx-x-circle",
  pending:  "bx-time-five",
};

export const EMPTY_FORM = {
  startDate:   "",
  endDate:     "",
  reason:      "",
  leaveTypeId: "",
  leaveTime:   "Full day",
};

export const STUDENT_LEAVE_TYPES = [
  { id: "casual", label: "Casual Leave" },
  { id: "sick",   label: "Sick Leave" },
];

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
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const normStatus = (status) => (status || "Pending").toLowerCase();

/** Prefer a real person name; never treat admission/staff/roll ids as the name. */
export const getRowName = (row = {}) => {
  const idLike = new Set(
    [row.userName, row.admissionNo, row.staffId, row.rollNo, row.userId]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );

  const candidates = [
    row.studentName,
    row.staffName,
    row.name,
    row.employeeName,
    row.fullName,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  const realName = candidates.find((name) => !idLike.has(name));
  return realName || candidates[0] || "-";
};

/** Derive stats object from a leave list */
export const statsOf = (list) => ({
  total:    list.length,
  pending:  list.filter((r) => normStatus(r.status) === "pending").length,
  accepted: list.filter((r) => normStatus(r.status) === "accepted").length,
  rejected: list.filter((r) => normStatus(r.status) === "rejected").length,
});

/** Filter a leave list by search query (name / reason / type / status) */
export const filterLeaves = (list, search) => {
  if (!search.trim()) return list;
  const q = search.toLowerCase();
  return list.filter((r) => {
    const name   = getRowName(r).toLowerCase();
    const reason = (r.reason || "").toLowerCase();
    const rawType = r.leaveType || r.leaveTypeName || "";
    const type   = (STUDENT_LEAVE_TYPES.find((lt) => lt.id === rawType)?.label || rawType).toLowerCase();
    const status = (r.status || "Pending").toLowerCase();
    return name.includes(q) || reason.includes(q) || type.includes(q) || status.includes(q);
  });
};

/** Filter a leave list by status value ("" = all) */
export const filterByStatus = (list, status) => {
  if (!status) return list;
  return list.filter((r) => (r.status || "Pending") === status);
};
