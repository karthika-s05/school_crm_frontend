// Shared attendance status definitions, colors and helpers (Attendance v2)

export const STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "Leave",
  LATE: "Late",
  HALF_DAY: "Half Day",
  MEDICAL_LEAVE: "Medical Leave",
};

// Statuses available when marking staff attendance
export const STAFF_STATUSES = [
  STATUS.PRESENT,
  STATUS.ABSENT,
  STATUS.LEAVE,
  STATUS.LATE,
  STATUS.HALF_DAY,
];

// Students additionally support Medical Leave
export const STUDENT_STATUSES = [...STAFF_STATUSES, STATUS.MEDICAL_LEAVE];

export const STATUS_META = {
  [STATUS.PRESENT]:       { key: "present",      color: "#16a34a", bg: "#dcfce7", icon: "bx bxs-check-circle" },
  [STATUS.ABSENT]:        { key: "absent",       color: "#ef4444", bg: "#fee2e2", icon: "bx bxs-x-circle" },
  [STATUS.LEAVE]:         { key: "leave",        color: "#f59e0b", bg: "#fef3c7", icon: "bx bxs-calendar-x" },
  [STATUS.LATE]:          { key: "late",         color: "#ea580c", bg: "#ffedd5", icon: "bx bx-time-five" },
  [STATUS.HALF_DAY]:      { key: "halfday",      color: "#8b5cf6", bg: "#ede9fe", icon: "bx bx-adjust" },
  [STATUS.MEDICAL_LEAVE]: { key: "medicalleave", color: "#0891b2", bg: "#cffafe", icon: "bx bx-plus-medical" },
};

export const statusMeta = (status) =>
  STATUS_META[status] || { key: "unmarked", color: "#64748b", bg: "#eef2f7", icon: "bx bx-minus-circle" };

/** Map various backend status representations to canonical labels */
export const normalizeStatus = (raw) => {
  if (raw === true || raw === 1) return STATUS.PRESENT;
  if (raw === false || raw === 0) return STATUS.ABSENT;
  if (raw === null || raw === undefined || raw === "") return "";
  const s = String(raw).trim().toLowerCase().replace(/[_-]/g, " ");
  if (["p", "present"].includes(s)) return STATUS.PRESENT;
  if (["a", "absent"].includes(s)) return STATUS.ABSENT;
  if (["l", "leave"].includes(s)) return STATUS.LEAVE;
  if (["lt", "late"].includes(s)) return STATUS.LATE;
  if (["hd", "half day", "halfday"].includes(s)) return STATUS.HALF_DAY;
  if (["ml", "medical leave", "medicalleave", "medical"].includes(s)) return STATUS.MEDICAL_LEAVE;
  return String(raw);
};

/** Count records per status. Returns { [statusLabel]: n, total } */
export const countByStatus = (records, statuses, getStatus = (r) => r.status) => {
  const counts = { total: records.length };
  statuses.forEach((s) => { counts[s] = 0; });
  records.forEach((r) => {
    const st = normalizeStatus(getStatus(r));
    if (counts[st] !== undefined) counts[st] += 1;
  });
  return counts;
};

export const todayISO = () => new Date().toISOString().split("T")[0];
export const currentMonthISO = () => new Date().toISOString().slice(0, 7);

export const getInitials = (name) =>
  (name || "?")
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const AVATAR_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
export const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

/** Build a display name from common row shapes */
export const personName = (r) =>
  r.studentName ||
  r.staffName ||
  r.name ||
  `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
  "-";
