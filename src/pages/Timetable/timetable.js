import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./timetable.css";
import {
  getPeriodSlot,
  getTimeTable,
  getStaffTimetable,
  getClass,
  getSection,
  getSubject,
  getSubjectStaff,
  getDay,
  postTimeTable,
  getMySubstituteRequests,
  acceptSubstituteRequest,
  rejectSubstituteRequest,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };
const DAY_COLORS = {
  Monday: "#2D3A8C", Tuesday: "#E8541A", Wednesday: "#16a34a",
  Thursday: "#d97706", Friday: "#9333ea", Saturday: "#0284c7",
};
const FALLBACK_DAY_IDS = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};
const CANONICAL_SCHEDULE = [
  { key: "period-1", label: "1", startTime: "09:15 AM", endTime: "10:00 AM", slotType: "normal" },
  { key: "period-2", label: "2", startTime: "10:00 AM", endTime: "10:45 AM", slotType: "normal" },
  { key: "morning-break", label: "Morning Break", startTime: "10:45 AM", endTime: "11:00 AM", slotType: "break" },
  { key: "period-3", label: "3", startTime: "11:00 AM", endTime: "11:45 AM", slotType: "normal" },
  { key: "period-4", label: "4", startTime: "11:45 AM", endTime: "12:30 PM", slotType: "normal" },
  { key: "lunch-break", label: "Lunch Break", startTime: "12:30 PM", endTime: "01:15 PM", slotType: "lunch" },
  { key: "period-5", label: "5", startTime: "01:15 PM", endTime: "02:00 PM", slotType: "normal" },
  { key: "period-6", label: "6", startTime: "02:00 PM", endTime: "02:45 PM", slotType: "normal" },
  { key: "afternoon-break", label: "Afternoon Break", startTime: "02:45 PM", endTime: "03:00 PM", slotType: "afternoon-break" },
  { key: "period-7", label: "7", startTime: "03:00 PM", endTime: "03:45 PM", slotType: "normal" },
  { key: "period-8", label: "8", startTime: "03:45 PM", endTime: "04:30 PM", slotType: "normal" },
];
const DAY_ALIASES = {
  monday: "Monday", mon: "Monday",
  tuesday: "Tuesday", tue: "Tuesday", tues: "Tuesday",
  wednesday: "Wednesday", wed: "Wednesday",
  thursday: "Thursday", thu: "Thursday", thur: "Thursday", thurs: "Thursday",
  friday: "Friday", fri: "Friday",
  saturday: "Saturday", sat: "Saturday",
};

/** Resolve API day name / id / short label to a DAYS key, or null. */
const resolveDayName = (raw, dayNameById = {}) => {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number" || /^\d+$/.test(String(raw).trim())) {
    const byId = dayNameById[Number(raw)] || dayNameById[String(raw)];
    if (byId && DAYS.includes(byId)) return byId;
    const fallback = DAYS[Number(raw) - 1];
    return fallback || null;
  }
  const text = String(raw).trim();
  if (DAYS.includes(text)) return text;
  return DAY_ALIASES[text.toLowerCase()] || null;
};

const normTime = (t) => (t || "").replace(/\s/g, "").toLowerCase();

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.periodSlots)) return value.periodSlots;
  return [];
};

const toMinutes = (t) => {
  if (!t) return 0;
  const s = String(t).trim().toUpperCase();
  const pm = s.includes("PM");
  const am = s.includes("AM");
  const clean = s.replace(/AM|PM/g, "").trim();
  let [h, m] = clean.split(":").map(Number);
  if (Number.isNaN(h)) return 0;
  if (pm && h !== 12) h += 12;
  if (am && h === 12) h = 0;
  return h * 60 + (m || 0);
};

const matchesScheduleTime = (rawTime, scheduleTime) => {
  const actual = toMinutes(rawTime);
  const expected = toMinutes(scheduleTime);
  // Some existing period records store afternoon values as 01:15/02:00
  // without PM. Treat those as their afternoon equivalent.
  return actual === expected || (expected >= 13 * 60 && actual + 12 * 60 === expected);
};

const slotTimeKey = (start) => `t${toMinutes(start)}`;

const rowTimeKeys = (start) => {
  if (!start) return [];
  const mins = toMinutes(start);
  const keys = [`t${mins}`];
  // Some records store afternoon periods without PM (e.g. "01:15 AM")
  if (mins < 9 * 60) keys.push(`t${mins + 12 * 60}`);
  return keys;
};

const getGridCell = (source, day, slotId, slotStartTime) => {
  if (!source?.[day]) return undefined;
  const key = String(slotId);
  const byId = source[day][key] ?? source[day][Number(slotId)];
  if (byId) return byId;
  if (slotStartTime) {
    const timeKey = slotTimeKey(slotStartTime);
    return source[day][timeKey];
  }
  return undefined;
};

const buildEmptyGrid = () => {
  const g = {};
  DAYS.forEach((day) => { g[day] = {}; });
  return g;
};

const normalizeFieldValue = (value) => {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") {
    return "";
  }
  return String(value);
};

export const buildTimetableSavePayload = ({ id, classId, sectionId, dayId, periodSlotId, subjectId, staffId }) => ({
  id: Number(id) || 0,
  classId: Number(classId) || 0,
  sectionId: Number(sectionId) || 0,
  dayId: Number(dayId) || 0,
  periodSlotId: Number(periodSlotId) || 0,
  subjectId: Number(subjectId) || 0,
  staffId: normalizeFieldValue(staffId),
});

/**
 * Build grid rows ONLY from Period Slot Master.
 * Timetable API must never add/remove rows.
 */
export const mapSlots = (list) => {
  const rows = asArray(list);
  return CANONICAL_SCHEDULE.map((schedule) => {
    const source = rows.find((slot) => {
      const start = slot?.startTime ?? slot?.["start Time"];
      const end = slot?.endTime ?? slot?.["end Time"];
      return (
        matchesScheduleTime(start, schedule.startTime) &&
        matchesScheduleTime(end, schedule.endTime)
      );
    });
    const isBreak = schedule.slotType !== "normal";
    const color =
      schedule.slotType === "lunch"
        ? "#16a34a"
        : schedule.slotType === "afternoon-break"
          ? "#0284c7"
          : isBreak
            ? "#f59e0b"
            : "#2d3a8c";
    const bg =
      schedule.slotType === "lunch"
        ? "#f0fdf4"
        : schedule.slotType === "afternoon-break"
          ? "#f0f9ff"
          : isBreak
            ? "#fffbeb"
            : "#f8fafc";
    return {
      id: isBreak
        ? schedule.key
        : source?.id ?? source?.slotId ?? source?.periodSlotId ?? `missing-${schedule.key}`,
      label: schedule.label,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotType: schedule.slotType,
      isBreak,
      configured: isBreak || Boolean(source),
      color,
      bg,
      source,
    };
  });
};

/** Merge class timetable records into an empty day×slot grid by period slot + day. */
export const mergeTimetableIntoGrid = (timetableRows, dayNameById, slots = []) => {
  const next = buildEmptyGrid();
  const gridKeyByPeriodSlotId = {};
  asArray(slots).forEach((slot) => {
    const periodSlotId =
      slot?.source?.id ?? slot?.source?.slotId ?? slot?.source?.periodSlotId;
    if (periodSlotId != null && periodSlotId !== "") {
      gridKeyByPeriodSlotId[String(periodSlotId)] = String(slot.id);
    }
  });

  asArray(timetableRows).forEach((row) => {
    const slotId = row?.periodSlotId ?? row?.slotId ?? row?.period_slot_id ?? row?.periodSlotID;
    if (slotId === undefined || slotId === null || slotId === "") return;

    const day = resolveDayName(
      row?.day ?? row?.dayName ?? row?.dayId ?? row?.day_id ?? row?.dayid,
      dayNameById
    );
    if (!day || !next[day]) return;

    const subjectId = normalizeFieldValue(row?.subjectId ?? row?.subject_id);
    const staffId = normalizeFieldValue(
      row?.staffId ?? row?.staff_id ?? row?.teacherId
    );
    const rowId = Number(row?.id) || 0;
    // Skip empty shell rows (period exists but no timetable assignment)
    if (!rowId && (!subjectId || subjectId === "0") && !staffId) return;

    let gridKey = gridKeyByPeriodSlotId[String(slotId)] || String(slotId);
    const rowStart = row?.startTime ?? row?.["start Time"];
    if (rowStart && !asArray(slots).some((slot) => String(slot.id) === gridKey)) {
      const matchingSlot = asArray(slots).find(
        (slot) =>
          !slot.isBreak &&
          matchesScheduleTime(rowStart, slot.startTime)
      );
      if (matchingSlot) gridKey = String(matchingSlot.id);
    }

    const cell = {
      id: rowId,
      subjectId: subjectId && subjectId !== "0" ? subjectId : "",
      staffId,
      staffName: row?.staffName ?? row?.teacherName ?? "",
      subjectName: row?.subject ?? row?.subjectName ?? "",
    };

    next[day][gridKey] = cell;
    rowTimeKeys(rowStart).forEach((key) => {
      next[day][key] = cell;
    });
  });
  return next;
};

const buildDayMaps = (dayRows) => {
  const dayNameById = {};
  const dayIdByName = { ...FALLBACK_DAY_IDS };
  asArray(dayRows).forEach((d, i) => {
    const id = d?.id ?? d?.dayId ?? i + 1;
    const rawName = d?.day ?? d?.dayName ?? d?.name ?? DAYS[i];
    const name = resolveDayName(rawName) || rawName;
    if (!name) return;
    dayNameById[Number(id)] = name;
    dayNameById[String(id)] = name;
    dayIdByName[name] = Number(id);
  });
  DAYS.forEach((name, i) => {
    if (!dayIdByName[name]) dayIdByName[name] = FALLBACK_DAY_IDS[name] || i + 1;
    const id = dayIdByName[name];
    if (!dayNameById[id]) dayNameById[id] = name;
  });
  return { dayNameById, dayIdByName };
};

/* ═══════════════════════════════════════════════════════════
   WEEKLY READ-ONLY GRID  (Staff & Student)
   Rows always come from Period Slot Master / canonical schedule.
═══════════════════════════════════════════════════════════ */
const getWeekRange = (anchor = new Date()) => {
  const d = new Date(anchor);
  const day = d.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  const toIso = (x) => x.toISOString().slice(0, 10);
  return { weekStart: toIso(monday), weekEnd: toIso(saturday), monday };
};

const dayFromDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const name = names[d.getDay()];
  return DAYS.includes(name) ? name : null;
};

function WeeklyReadOnlyGrid({
  mode, // "staff" | "student"
  slots,
  rows,
  substitutes = [],
  pendingRequests = [],
  title,
  subtitle,
  onAccept,
  onReject,
  actionLoadingId,
}) {
  const gridMap = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = {}; });
    asArray(rows).forEach((row) => {
      const day = resolveDayName(row.day ?? row.dayName ?? row.dayId ?? row.day_id);
      if (!day || !map[day]) return;
      const cell = {
        ...row,
        cellType: row.cellType || "assigned",
      };
      const slotId = row.periodSlotId ?? row.slotId ?? row.period_slot_id;
      if (slotId != null && slotId !== "") map[day][String(slotId)] = cell;
      rowTimeKeys(row.startTime ?? row["start Time"]).forEach((key) => {
        map[day][key] = cell;
      });
    });

    // Overlay date-agnostic weekly substitute hints by weekday
    asArray(substitutes).forEach((sub) => {
      const day =
        dayFromDate(sub.substituteDate) ||
        resolveDayName(sub.day ?? sub.dayName ?? sub.dayId);
      if (!day || !map[day]) return;
      const slotId = sub.periodSlotId ?? sub.slotId;
      const keys = [];
      if (slotId != null && slotId !== "") keys.push(String(slotId));
      keys.push(...rowTimeKeys(sub.startTime ?? sub["start Time"]));
      if (!keys.length) return;
      const existing = keys.map((k) => map[day][k]).find(Boolean) || {};
      const merged = {
        ...existing,
        ...sub,
        cellType: sub.cellType || existing.cellType || "pending_request",
      };
      keys.forEach((k) => { map[day][k] = merged; });
    });
    return map;
  }, [rows, substitutes]);

  const pendingByKey = useMemo(() => {
    const map = {};
    asArray(pendingRequests).forEach((req) => {
      const day =
        dayFromDate(req.substituteDate) ||
        resolveDayName(req.day ?? req.dayId);
      if (!day) return;
      if (String(req.status || "").toLowerCase() !== "pending") return;
      const slotId = req.periodSlotId;
      if (slotId != null && slotId !== "") map[`${day}|${slotId}`] = req;
      rowTimeKeys(req.startTime ?? req["start Time"]).forEach((key) => {
        map[`${day}|${key}`] = req;
      });
    });
    return map;
  }, [pendingRequests]);

  const cellClass = (slot, cell, pending) => {
    if (slot.isBreak) return "tt-wk-cell break";
    if (pending || cell?.cellType === "pending_request") return "tt-wk-cell pending";
    if (cell?.cellType === "accepted_substitute") return "tt-wk-cell substitute";
    if (cell && (cell.subjectName || cell.subject || cell.className)) return "tt-wk-cell assigned";
    return "tt-wk-cell free";
  };

  return (
    <div className="tt-root">
      <div className="tt-topbar">
        <div>
          <h1 className="tt-page-title">{title}</h1>
          <p className="tt-page-sub">{subtitle}</p>
        </div>
      </div>

      <div className="tt-legend">
        <span className="tt-legend-item"><i className="dot assigned"></i> Assigned</span>
        <span className="tt-legend-item"><i className="dot free"></i> Free Period</span>
        <span className="tt-legend-item"><i className="dot break"></i> Break / Lunch</span>
        {mode === "staff" && (
          <>
            <span className="tt-legend-item"><i className="dot pending"></i> Substitute Pending</span>
            <span className="tt-legend-item"><i className="dot substitute"></i> Accepted Substitute</span>
          </>
        )}
      </div>

      {slots.length === 0 ? (
        <div className="tt-empty"><i className="bx bx-time-five"></i><p>No period slots configured yet.</p></div>
      ) : (
        <div className="tt-table-wrap">
          <table className="tt-table tt-weekly-ro">
            <thead>
              <tr>
                <th className="tt-th-period">Period</th>
                {DAYS.map((day) => (
                  <th key={day} style={{ color: DAY_COLORS[day] }}>{DAY_SHORT[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td className="tt-td-day" style={{ borderLeftColor: slot.isBreak ? slot.color : "#2d3a8c" }}>
                    <div className="tt-th-slot-num">{slot.isBreak ? slot.label : `P${slot.label}`}</div>
                    <div className="tt-th-slot-time">
                      {slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const timeKey = slotTimeKey(slot.startTime);
                    const cell =
                      gridMap[day]?.[String(slot.id)] ?? gridMap[day]?.[timeKey];
                    const pending =
                      pendingByKey[`${day}|${slot.id}`] ??
                      pendingByKey[`${day}|${timeKey}`];

                    if (slot.isBreak) {
                      return (
                        <td key={`${day}-${slot.id}`} className={cellClass(slot, cell, pending)}>
                          <div className="tt-wk-inner break" style={{ color: slot.color }}>
                            <i className="bx bx-coffee"></i>
                            <span>{slot.label}</span>
                          </div>
                        </td>
                      );
                    }

                    if (mode === "staff") {
                      const hasAssignment = cell && (cell.subjectName || cell.subject || cell.className) && cell.cellType !== "free";
                      return (
                        <td key={`${day}-${slot.id}`} className={cellClass(slot, cell, pending)}>
                          {hasAssignment ? (
                            <div className="tt-wk-inner">
                              <div className="tt-wk-class">
                                {cell.className || cell.classId || "-"}
                                {cell.sectionName || cell.sectionId
                                  ? `-${cell.sectionName || cell.sectionId}`
                                  : ""}
                              </div>
                              <div className="tt-wk-subject">{cell.subjectName || cell.subject || "-"}</div>
                              {cell.cellType === "accepted_substitute" && (
                                <div className="tt-wk-badge blue">Substitute</div>
                              )}
                              {pending && (
                                <div className="tt-wk-actions">
                                  <button
                                    type="button"
                                    className="tt-sub-btn accept"
                                    disabled={actionLoadingId === pending.id}
                                    onClick={() => onAccept?.(pending.id)}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    className="tt-sub-btn reject"
                                    disabled={actionLoadingId === pending.id}
                                    onClick={() => onReject?.(pending.id)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : pending ? (
                            <div className="tt-wk-inner">
                              <div className="tt-wk-badge red">Cover Request</div>
                              <div className="tt-wk-class">
                                {pending.className || pending.classId}-{pending.sectionName || pending.sectionId}
                              </div>
                              <div className="tt-wk-subject">{pending.subjectName || "-"}</div>
                              <div className="tt-wk-meta">{pending.absentStaffName || "Colleague"} on leave</div>
                              <div className="tt-wk-actions">
                                <button
                                  type="button"
                                  className="tt-sub-btn accept"
                                  disabled={actionLoadingId === pending.id}
                                  onClick={() => onAccept?.(pending.id)}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className="tt-sub-btn reject"
                                  disabled={actionLoadingId === pending.id}
                                  onClick={() => onReject?.(pending.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="tt-wk-inner free">
                              <i className="bx bx-minus-circle"></i>
                              <span>Free Period</span>
                            </div>
                          )}
                        </td>
                      );
                    }

                    // Student: original published staff only
                    return (
                      <td key={`${day}-${slot.id}`} className={cellClass(slot, cell, false)}>
                        {cell && (cell.subjectName || cell.subject) ? (
                          <div className="tt-wk-inner">
                            <div className="tt-wk-subject">{cell.subjectName || cell.subject || "-"}</div>
                            <div className="tt-wk-meta">
                              <i className="bx bxs-user"></i>
                              {cell.staffName || cell.teacherName || "Staff Not Assigned"}
                            </div>
                          </div>
                        ) : (
                          <div className="tt-wk-inner free">
                            <i className="bx bx-minus-circle"></i>
                            <span>Free Period</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === "staff" && asArray(pendingRequests).filter((r) => String(r.status).toLowerCase() === "pending").length > 0 && (
        <div className="tt-sub-panel">
          <h3>Pending Substitute Requests</h3>
          <ul>
            {asArray(pendingRequests)
              .filter((r) => String(r.status).toLowerCase() === "pending")
              .map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>{r.absentStaffName || r.absentStaffId}</strong> leave ·{" "}
                    {r.subjectName} · {r.className}-{r.sectionName} ·{" "}
                    {String(r.substituteDate || "").slice(0, 10)} · {r.startTime}–{r.endTime}
                  </div>
                  <div className="tt-wk-actions">
                    <button type="button" className="tt-sub-btn accept" disabled={actionLoadingId === r.id} onClick={() => onAccept?.(r.id)}>Accept</button>
                    <button type="button" className="tt-sub-btn reject" disabled={actionLoadingId === r.id} onClick={() => onReject?.(r.id)}>Reject</button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}

function StaffTimetable() {
  const token = getToken();
  const staffName = getUserData("staffName") || getUserData("userName") || "Teacher";
  const [slots, setSlots] = useState([]);
  const [rows, setRows] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const load = async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const { weekStart, weekEnd } = getWeekRange();
      const [slotRes, ttRes, subRes] = await Promise.all([
        getPeriodSlot(0, token).catch(() => null),
        getStaffTimetable({ dayId: 0, weekStart, weekEnd }, token).catch(() => null),
        getMySubstituteRequests(token).catch(() => null),
      ]);
      setSlots(mapSlots(slotRes));
      setRows(asArray(ttRes?.data ?? ttRes));
      setSubstitutes(asArray(ttRes?.substitutes));
      setPendingRequests(asArray(subRes?.data ?? subRes));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const handleAccept = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await acceptSubstituteRequest(id, token);
      if (res?.status === "Error" || res?.status === "error") {
        toast.error(res?.message || "Accept failed");
      } else {
        toast.success(res?.message || "Substitute accepted");
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Accept failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await rejectSubstituteRequest(id, token);
      if (res?.status === "Error" || res?.status === "error") {
        toast.error(res?.message || "Reject failed");
      } else {
        toast.info(res?.message || "Substitute rejected");
        await load();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Reject failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <div className="tt-root"><div className="tt-loading"><div className="tt-spinner"></div><span>Loading…</span></div></div>;
  }
  return (
    <WeeklyReadOnlyGrid
      mode="staff"
      rows={rows}
      slots={slots}
      substitutes={substitutes}
      pendingRequests={pendingRequests}
      // title="My Timetable"
      // subtitle={`${staffName} · Weekly view · Green = assigned · Gray = free · Red = pending cover · Blue = accepted substitute`}
      onAccept={handleAccept}
      onReject={handleReject}
      actionLoadingId={actionLoadingId}
    />
  );
}

function StudentTimetable() {
  const token = getToken();
  const classId = getUserData("classId") || "0";
  const sectionId = getUserData("sectionId") || "0";
  const studentName = getUserData("studentName") || "Student";
  const className = getUserData("className") || classId;
  const sectionName = getUserData("sectionName") || sectionId;
  const [slots, setSlots] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const [slotRes, ttRes] = await Promise.all([
          getPeriodSlot(Number(classId) || 0, token).catch(() => null),
          getTimeTable({ classId: Number(classId), sectionId: Number(sectionId), dayId: 0 }, token).catch(() => null),
        ]);
        setSlots(mapSlots(slotRes));
        setRows(asArray(ttRes));
      } finally {
        setLoading(false);
      }
    })();
  }, [token, classId, sectionId]);

  if (loading) {
    return <div className="tt-root"><div className="tt-loading"><div className="tt-spinner"></div><span>Loading…</span></div></div>;
  }
  return (
    <WeeklyReadOnlyGrid
      mode="student"
      rows={rows}
      slots={slots}
      title="My Timetable"
      subtitle={`${studentName} · Class ${className} – Section ${sectionName} · Read-only published timetable`}
    />
  );
}

function AdminTimetable() {
  const token = getToken();

  const [rawSlots, setRawSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectStaffMap, setSubjectStaffMap] = useState({});
  const [dayNameById, setDayNameById] = useState({});
  const [dayIdByName, setDayIdByName] = useState(FALLBACK_DAY_IDS);

  const [selClassId, setSelClassId] = useState("");
  const [selSectionId, setSelSectionId] = useState("");

  const [grid, setGrid] = useState(buildEmptyGrid);
  const [origGrid, setOrigGrid] = useState(buildEmptyGrid);

  const [metaLoading, setMetaLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loadingTt, setLoadingTt] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Grid structure depends ONLY on Period Slot Master for the selected class */
  const slots = useMemo(() => mapSlots(rawSlots), [rawSlots]);
  const configuredTeachingSlots = useMemo(
    () => slots.filter((slot) => !slot.isBreak && slot.configured).length,
    [slots]
  );

  const sections = useMemo(() => {
    if (!selClassId) return [];
    return allSections.filter((s) => {
      const cid = s.classId ?? s.class_id;
      return cid == null || String(cid) === String(selClassId);
    });
  }, [allSections, selClassId]);

  /* Page load: masters only - period slots load after Class is selected */
  useEffect(() => {
    if (!token) { setMetaLoading(false); return; }
    let cancelled = false;
    (async () => {
      setMetaLoading(true);
      try {
        const [classRes, sectionRes, subjectRes, dayRes] = await Promise.all([
          getClass(0, token).catch(() => []),
          getSection(0, token).catch(() => []),
          getSubject(0, token).catch(() => []),
          getDay(token).catch(() => []),
        ]);
        if (cancelled) return;

        setClasses(asArray(classRes));
        setAllSections(asArray(sectionRes));
        setSubjects(asArray(subjectRes));

        const maps = buildDayMaps(dayRes);
        setDayNameById(maps.dayNameById);
        setDayIdByName(maps.dayIdByName);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  /* Rebuild period-slot rows when Class changes (DB slots are per classId) */
  useEffect(() => {
    if (!token || !selClassId) {
      setRawSlots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setSlotsLoading(true);
      try {
        const slotRes = await getPeriodSlot(Number(selClassId), token).catch(() => []);
        if (cancelled) return;
        setRawSlots(asArray(slotRes));
        setGrid(buildEmptyGrid());
        setOrigGrid(buildEmptyGrid());
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, selClassId]);

  const handleClassChange = (value) => {
    setSelClassId(value);
    setSelSectionId("");
    setGrid(buildEmptyGrid());
    setOrigGrid(buildEmptyGrid());
  };

  const handleSectionChange = (value) => {
    setSelSectionId(value);
    /* Section does not change period-slot rows - only clear filled cells */
    setGrid(buildEmptyGrid());
    setOrigGrid(buildEmptyGrid());
  };

  const loadTimetable = useCallback(async ({ showToast = true } = {}) => {
    if (!selClassId || !selSectionId) {
      if (showToast) toast.error("Please select Class and Section.");
      return;
    }
    setLoadingTt(true);
    try {
      const res = await getTimeTable(
        { dayId: 0, classId: Number(selClassId), sectionId: Number(selSectionId) },
        token
      );
      const rows = asArray(res);
      const merged = mergeTimetableIntoGrid(rows, dayNameById, slots);
      const subjectIds = [
        ...new Set(
          rows
            .map((row) => normalizeFieldValue(row?.subjectId ?? row?.subject_id))
            .filter(Boolean)
        ),
      ];
      const staffEntries = await Promise.all(
        subjectIds.map(async (subjectId) => {
          try {
            const response = await getSubjectStaff(subjectId, token);
            return [subjectId, asArray(response?.data?.staff)];
          } catch {
            return [subjectId, []];
          }
        })
      );
      setSubjectStaffMap((prev) => ({
        ...prev,
        ...Object.fromEntries(staffEntries),
      }));
      setGrid(merged);
      setOrigGrid(JSON.parse(JSON.stringify(merged)));
      if (showToast) {
        const filled = rows.length;
        toast.success(
          filled
            ? `Timetable loaded (${filled} assignment${filled === 1 ? "" : "s"}).`
            : configuredTeachingSlots
              ? "No timetable saved yet for this section. Assign subjects and teachers in the grid, then Save."
              : "No timetable saved. Configure Period Slots for this class in Master first, then assign here."
        );
      }
    } catch (err) {
      if (showToast) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load timetable.");
      }
    } finally {
      setLoadingTt(false);
    }
  }, [selClassId, selSectionId, token, dayNameById, slots, configuredTeachingSlots]);

  useEffect(() => {
    if (!selClassId || !selSectionId || slotsLoading) return;
    loadTimetable({ showToast: false });
  }, [selClassId, selSectionId, slotsLoading, loadTimetable]);

  const handleLoad = () => loadTimetable({ showToast: true });

  const updateGridCell = (day, slotId, changes) => {
    setGrid((prev) => {
      const key = String(slotId);
      const prevCell = prev?.[day]?.[key] ?? { id: 0, subjectId: "", staffId: "" };
      return {
        ...prev,
        [day]: {
          ...(prev?.[day] ?? {}),
          [key]: {
            ...prevCell,
            ...changes,
          },
        },
      };
    });
  };

  const handleSubjectChange = async (day, slotId, subjectId) => {
    const normalizedSubjectId = normalizeFieldValue(subjectId);
    if (!normalizedSubjectId) {
      updateGridCell(day, slotId, {
        subjectId: "",
        subjectName: "",
        staffId: "",
        staffName: "",
        staffLoading: false,
      });
      return;
    }

    const subject = subjects.find(
      (item) => String(item.id) === String(normalizedSubjectId)
    );
    updateGridCell(day, slotId, {
      subjectId: normalizedSubjectId,
      subjectName: subject?.subjectName ?? subject?.name ?? subject?.subject ?? "",
      staffId: "",
      staffName: "",
      staffLoading: true,
    });

    try {
      const response = await getSubjectStaff(normalizedSubjectId, token);
      const staffOptions = asArray(response?.data?.staff);
      setSubjectStaffMap((prev) => ({
        ...prev,
        [normalizedSubjectId]: staffOptions,
      }));
      updateGridCell(day, slotId, {
        staffLoading: false,
      });
    } catch (error) {
      setSubjectStaffMap((prev) => ({
        ...prev,
        [normalizedSubjectId]: [],
      }));
      updateGridCell(day, slotId, {
        staffLoading: false,
      });
    }
  };

  const handleStaffChange = (day, slotId, subjectId, staffId) => {
    const staff = asArray(subjectStaffMap[subjectId]).find(
      (item) => String(item.staffId) === String(staffId)
    );
    updateGridCell(day, slotId, {
      staffId: normalizeFieldValue(staffId),
      staffName: staff?.staffName || "",
    });
  };

  const handleSave = async () => {
    if (!selClassId || !selSectionId) {
      toast.error("Please select Class and Section before saving.");
      return;
    }
    setSaving(true);
    try {
      const payloads = [];
      DAYS.forEach((day) => {
        const dayId = dayIdByName[day] || FALLBACK_DAY_IDS[day];
        slots.forEach((slot) => {
          if (slot.isBreak || !slot.configured) return;
          const cell = getGridCell(grid, day, slot.id, slot.startTime);
          if (!cell?.subjectId) return;
          if (!cell.staffId) {
            throw new Error(`Select staff for ${day}, Period ${slot.label}.`);
          }
          const periodSlotId = Number(slot.source?.id ?? slot.source?.periodSlotId ?? 0);
          if (!periodSlotId) {
            throw new Error(
              `Period ${slot.label} is not configured in Master → Period Slot for this class.`
            );
          }
          payloads.push(
            buildTimetableSavePayload({
              id: cell.id || 0,
              classId: selClassId,
              sectionId: selSectionId,
              dayId,
              periodSlotId,
              subjectId: cell.subjectId,
              staffId: cell.staffId,
            })
          );
        });
      });

      if (!payloads.length) {
        toast.error("Nothing to save. Assign at least one subject.");
        setSaving(false);
        return;
      }

      for (const body of payloads) {
        const res = await postTimeTable(body, token);
        if (res?.status === "Error" || res?.status === "error") {
          throw new Error(res?.message || "Save failed");
        }
      }
      setOrigGrid(JSON.parse(JSON.stringify(grid)));
      toast.success(`Saved ${payloads.length} timetable cell${payloads.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save timetable.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGrid(JSON.parse(JSON.stringify(origGrid)));
    toast.info("Changes reset.");
  };

  if (metaLoading) {
    return (
      <div className="tt-root">
        <div className="tt-loading"><div className="tt-spinner"></div><span>Loading period slots…</span></div>
      </div>
    );
  }

  return (
    <div className="tt-root">
      <div className="tt-filter-bar">
        <div className="tt-filter-group">
          <label>Class</label>
          <select value={selClassId} onChange={(e) => handleClassChange(e.target.value)}>
            <option value="">- Select Class -</option>
            {classes.map((c) => (
              <option key={c.id ?? c.classId} value={c.id ?? c.classId}>
                {c.className ?? c.name ?? c.class ?? `Class ${c.id ?? c.classId}`}
              </option>
            ))}
          </select>
        </div>
        <div className="tt-filter-group">
          <label>Section</label>
          <select
            value={selSectionId}
            onChange={(e) => handleSectionChange(e.target.value)}
            disabled={!selClassId}
          >
            <option value="">- Select Section -</option>
            {sections.map((s) => (
              <option key={s.id ?? s.sectionId} value={s.id ?? s.sectionId}>
                {s.sectionName ?? s.name ?? s.section ?? `Section ${s.id ?? s.sectionId}`}
              </option>
            ))}
          </select>
        </div>
        <button className="tt-load-btn" onClick={handleLoad} disabled={loadingTt}>
          {loadingTt
            ? <><span className="tt-btn-spinner"></span> Loading…</>
            : <><i className="bx bx-refresh"></i> Load Timetable</>
          }
        </button>
      </div>

      {selClassId && !slotsLoading && configuredTeachingSlots === 0 && (
        <div className="tt-warning-banner">
          <i className="bx bx-error-circle"></i>
          <span>
            <strong>No period slots configured for this class.</strong>{" "}
            Go to <strong>Master → Period Slot</strong>, add period timings for this class,
            then return here to assign subjects and teachers.
          </span>
        </div>
      )}

      {selClassId && !slotsLoading && configuredTeachingSlots > 0 && configuredTeachingSlots < 8 && (
        <div className="tt-warning-banner mild">
          <i className="bx bx-info-circle"></i>
          <span>
            Only {configuredTeachingSlots} of 8 teaching periods are configured for this class.
            Add the remaining period slots in <strong>Master → Period Slot</strong>.
          </span>
        </div>
      )}

      {slotsLoading ? (
        <div className="tt-empty">
          <div className="tt-spinner"></div>
          <p>Loading period slots for selected class…</p>
        </div>
      ) : (
        <div className="tt-grid-scroll">
          <table className="tt-grid-table">
            <thead>
              <tr>
                <th className="tt-th-day-col">
                  Period<br /><span className="tt-th-day-sub">Slot</span>
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="tt-th-slot" style={{ borderBottomColor: DAY_COLORS[day] }}>
                    <div className="tt-th-slot-num" style={{ color: DAY_COLORS[day] }}>{day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Always one row per Period Slot Master entry - never hide for missing timetable */}
              {slots.map((slot) => {
                if (slot.isBreak) {
                  return (
                    <tr key={slot.id}>
                      <td className="tt-td-day" style={{ borderLeftColor: slot.color }}>
                        <div className="tt-th-slot-num" style={{ color: slot.color }}>{slot.label}</div>
                        <div className="tt-th-slot-time">
                          {slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}
                        </div>
                      </td>
                      {DAYS.map((day) => (
                        <td
                          key={`${day}-${slot.id}`}
                          className="tt-td-break"
                          style={{
                            background: slot.bg,
                            borderLeftColor: slot.color,
                            borderRightColor: slot.color,
                          }}
                        >
                          <div className="tt-break-cell" style={{ color: slot.color, borderLeftColor: slot.color }}>
                            <i className="bx bx-coffee"></i>
                            <span>{slot.label}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id}>
                    <td className="tt-td-day" style={{ borderLeftColor: "#2d3a8c" }}>
                      <div className="tt-th-slot-num">P{slot.label}</div>
                      <div className="tt-th-slot-time">
                        {slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const cell = getGridCell(grid, day, slot.id, slot.startTime) ?? { id: 0, subjectId: "", staffId: "" };
                      if (!slot.configured) {
                        return (
                          <td key={`${day}-${slot.id}`} className="tt-td-cell tt-td-unconfigured">
                            <div className="tt-cell-hint">
                              <i className="bx bx-time-five"></i>
                              <span>Period slot not set up</span>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={`${day}-${slot.id}`} className="tt-td-cell">
                          <div className="tt-cell-inner">
                            <select
                              className="tt-cell-select subject"
                              value={cell.subjectId}
                              onChange={(e) => handleSubjectChange(day, slot.id, e.target.value)}
                            >
                              <option value="">Assign Subject</option>
                              {subjects
                                .filter((s) => {
                                  const name = s.subjectName ?? s.name ?? s.subject ?? "";
                                  return String(name).trim().toLowerCase() !== "break";
                                })
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.subjectName ?? s.name ?? s.subject ?? `Subject ${s.id}`}
                                  </option>
                                ))}
                            </select>
                            <select
                              className="tt-cell-select staff"
                              value={cell.staffId || ""}
                              disabled={!cell.subjectId || cell.staffLoading}
                              onChange={(e) =>
                                handleStaffChange(
                                  day,
                                  slot.id,
                                  cell.subjectId,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                {!cell.subjectId
                                  ? "Select subject first"
                                  : cell.staffLoading
                                    ? "Loading Staff…"
                                    : asArray(subjectStaffMap[cell.subjectId]).length
                                      ? "Assign Staff"
                                      : "No Matching Staff"}
                              </option>
                              {asArray(subjectStaffMap[cell.subjectId]).map((staff) => (
                                <option key={staff.staffId} value={staff.staffId}>
                                  {staff.staffName || staff.staffId}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="tt-bottom-bar">
        <div className="tt-note">
          <i className="bx bx-info-circle"></i>
          <span>
            <strong>How it works:</strong>{" "}
            {selClassId
              ? configuredTeachingSlots
                ? `This class has ${configuredTeachingSlots} period slot${configuredTeachingSlots === 1 ? "" : "s"} configured. Load Timetable shows saved assignments; if none exist, pick Subject and Staff in each cell, then Save.`
                : "This class has no period slots yet — configure them in Master → Period Slot before assigning a timetable."
              : "Select a Class to build the grid from Period Slot Master, then Section to load or create the timetable."}
          </span>
        </div>
        <div className="tt-bottom-actions">
          <button className="tt-hdr-btn outline" onClick={handleReset} disabled={saving}>
            <i className="bx bx-reset"></i> Reset
          </button>
          <button className="tt-hdr-btn primary" onClick={handleSave} disabled={saving || !slots.length}>
            {saving
              ? <><span className="tt-btn-spinner"></span> Saving…</>
              : <><i className="bx bxs-save"></i> Save Timetable</>
            }
          </button>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}

export default function Timetable() {
  const role = getUserData("role");
  if (role === "Staff") return <StaffTimetable />;
  if (role === "Student") return <StudentTimetable />;
  return <AdminTimetable />;
}
