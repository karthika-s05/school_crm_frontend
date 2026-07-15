import React, { useState, useMemo } from "react";
import "./timetable.css";
import {
  getPeriodSlot,
  getTimeTable,
  getStaffTimetable,
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

const normTime = (t) => (t || "").replace(/\s/g, "").toLowerCase();

const normalizeSlotRows = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.periodSlots)) return value.periodSlots;
  return [];
};

const normalizeTimetableRows = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
};

const getSlotCategory = (slot) => {
  const text = [
    slot?.slotType, slot?.slotTypeName, slot?.periodType,
    slot?.periodSlotType, slot?.type, slot?.slotName,
    slot?.name, slot?.label, slot?.startTime,
    slot?.["start Time"], slot?.endTime, slot?.["end Time"],
  ]
    .filter(Boolean)
    .map(v => String(v).trim())
    .join(" ")
    .toLowerCase();

  if (text.includes("lunch")) return "lunch";
  if (text.includes("evening break") || text.includes("eve break") || text.includes("eveningbreak")) return "evening-break";
  if (text.includes("break")) return "break";
  return "normal";
};

const getSlotDisplayLabel = (slot) => {
  const cat = getSlotCategory(slot);
  if (cat === "lunch") return "Lunch";
  if (cat === "evening-break") return "Eve. Break";
  return "Break";
};

const toMinutes = (t) => {
  if (!t) return 0;
  const s = t.trim().toUpperCase();
  const pm = s.includes("PM");
  const am = s.includes("AM");
  const clean = s.replace(/AM|PM/g, "").trim();
  let [h, m] = clean.split(":").map(Number);
  if (pm && h !== 12) h += 12;
  if (am && h === 12) h = 0;
  return h * 60 + (m || 0);
};

const getGridCell = (source, day, slotId) => {
  if (!source?.[day]) return undefined;
  const key = String(slotId);
  return source[day][key] ?? source[day][Number(slotId)] ?? undefined;
};

const buildEmptyGrid = () => {
  const g = {};
  DAYS.forEach(day => { g[day] = {}; });
  return g;
};

const normalizeFieldValue = (value) => {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") return "";
  return String(value);
};

const normalizeStaffValue = (value) => {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") return 0;
  const normalized = String(value).trim();
  return normalized === "0" ? 0 : normalized;
};

export const buildTimetableSavePayload = ({ id, classId, sectionId, dayId, periodSlotId, subjectId, staffId }) => ({
  id: Number(id) || 0,
  classId: Number(classId) || 0,
  sectionId: Number(sectionId) || 0,
  dayId: Number(dayId) || 0,
  periodSlotId: Number(periodSlotId) || 0,
  subjectId: Number(subjectId) || 0,
  staffId: normalizeStaffValue(staffId),
});

const mapSlots = (list) => {
  const rows = normalizeSlotRows(list);
  const normalised = rows
    .map((s, index) => {
      const startTime = s?.startTime ?? s?.["start Time"] ?? "";
      const endTime = s?.endTime ?? s?.["end Time"] ?? "";
      const category = getSlotCategory({ ...s, startTime, endTime });
      const isBreak = category !== "normal";
      return {
        id: s?.id ?? s?.slotId ?? s?.periodSlotId ?? s?.period_slot_id ?? index + 1,
        label: String(index + 1),
        startTime,
        endTime,
        isBreak,
        slotType: category,
        color: isBreak
          ? (category === "lunch" ? "#16a34a" : category === "evening-break" ? "#0284c7" : "#f59e0b")
          : "#2d3a8c",
        bg: isBreak
          ? (category === "lunch" ? "#f0fdf4" : category === "evening-break" ? "#f0f9ff" : "#fffbeb")
          : "#f8fafc",
        source: s,
      };
    })
    .sort((a, b) => {
      const diff = toMinutes(a.startTime) - toMinutes(b.startTime);
      return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id));
    });

  return normalised.map((slot, index) => ({
    ...slot,
    label: slot.isBreak ? getSlotDisplayLabel(slot) : String(index + 1),
  }));
};

/* ═══════════════════════════════════════════════════════════
   READ-ONLY GRID  (Staff & Student)
═══════════════════════════════════════════════════════════ */
function ReadOnlyGrid({ rows, slots, title, subtitle }) {
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || "Monday");

  const gridMap = useMemo(() => {
    const map = {};
    DAYS.forEach(d => { map[d] = {}; });
    rows.forEach(row => {
      const day = row.day ?? row.dayName ?? "";
      const start = normTime(row.startTime ?? row["start Time"] ?? "");
      if (day && start) map[day][start] = row;
    });
    return map;
  }, [rows]);

  return (
    <div className="tt-root">
      <div className="tt-topbar">
        <div>
          <h1 className="tt-page-title">{title}</h1>
          <p className="tt-page-sub">{subtitle}</p>
        </div>
      </div>

      <div className="tt-day-tabs">
        {DAYS.map(day => {
          const filled = slots.filter(s => gridMap[day]?.[normTime(s.startTime)]).length;
          return (
            <button
              key={day}
              className={`tt-day-tab${activeDay === day ? " active" : ""}`}
              style={activeDay === day ? { borderBottomColor: DAY_COLORS[day], color: DAY_COLORS[day] } : {}}
              onClick={() => setActiveDay(day)}
            >
              {DAY_SHORT[day]}
              <span className="tt-day-tab-count" style={activeDay === day ? { background: DAY_COLORS[day] } : {}}>
                {filled}
              </span>
            </button>
          );
        })}
      </div>

      {slots.length === 0 ? (
        <div className="tt-empty"><i className="bx bx-time-five"></i><p>No period slots configured yet.</p></div>
      ) : (
        <div className="tt-ro-periods">
          {slots.map(slot => {
            const row = gridMap[activeDay]?.[normTime(slot.startTime)];
            const accent = DAY_COLORS[activeDay];
            return (
              <div key={slot.id} className={`tt-ro-period${row ? " filled" : " empty"}`}>
                <div className="tt-ro-period-num" style={{ background: accent }}>P{slot.label}</div>
                <div className="tt-ro-period-time">{slot.startTime}{slot.endTime ? ` – ${slot.endTime}` : ""}</div>
                {row ? (
                  <div className="tt-ro-period-info" style={{ borderLeftColor: accent }}>
                    <div className="tt-ro-subject"><i className="bx bxs-book" style={{ color: accent }}></i><span>{row.subject ?? row.subjectName ?? "—"}</span></div>
                    {(row.teacher ?? row.teacherName ?? row.staffName) && (
                      <div className="tt-ro-teacher"><i className="bx bxs-user"></i><span>{row.teacher ?? row.teacherName ?? row.staffName}</span></div>
                    )}
                  </div>
                ) : (
                  <div className="tt-ro-period-free"><i className="bx bx-minus-circle"></i><span>Free Period</span></div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

function StaffTimetable() {
  const token = getToken();
  const staffName = getUserData("staffName") || "Teacher";
  const classId = getUserData("classId") || "0";
  const [slots, setSlots] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const [slotRes, ttRes] = await Promise.all([
          getPeriodSlot(token).catch(() => null),
          getStaffTimetable({ dayId: 0 }, token).catch(() => null),
        ]);
        setSlots(mapSlots(slotRes));
        setRows(Array.isArray(ttRes?.data) ? ttRes.data : Array.isArray(ttRes) ? ttRes : []);
      } finally { setLoading(false); }
    })();
  }, [token, classId]);

  if (loading) return <div className="tt-root"><div className="tt-loading"><div className="tt-spinner"></div><span>Loading…</span></div></div>;
  return <ReadOnlyGrid rows={rows} slots={slots} title="My Timetable" subtitle={`${staffName} · ${rows.length} periods assigned`} />;
}

function StudentTimetable() {
  const token = getToken();
  const classId = getUserData("classId") || "0";
  const sectionId = getUserData("sectionId") || "0";
  const studentName = getUserData("studentName") || "Student";
  const [slots, setSlots] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const [slotRes, ttRes] = await Promise.all([
          getPeriodSlot(token).catch(() => null),
          getTimeTable({ classId: Number(classId), sectionId: Number(sectionId) }, token).catch(() => null),
        ]);
        setSlots(mapSlots(slotRes));
        setRows(Array.isArray(ttRes) ? ttRes : Array.isArray(ttRes?.data) ? ttRes.data : []);
      } finally { setLoading(false); }
    })();
  }, [token, classId, sectionId]);

  if (loading) return <div className="tt-root"><div className="tt-loading"><div className="tt-spinner"></div><span>Loading…</span></div></div>;
  return <ReadOnlyGrid rows={rows} slots={slots} title="My Timetable" subtitle={`${studentName} · Class ${classId} – Section ${sectionId}`} />;
}

/* ═══════════════════════════════════════════════════════════
   ADMIN TIMETABLE
   ─ Grid is ALWAYS built from Period Slot Master (mock data).
   ─ Zero API calls — verify structure first, then reconnect.
═══════════════════════════════════════════════════════════ */

/* Mock period slots — replace with API data once structure is verified */
const MOCK_SLOTS = [
  { id: 1, startTime: "09:15 AM", endTime: "10:00 AM", slotType: "normal" },
  { id: 2, startTime: "10:00 AM", endTime: "10:45 AM", slotType: "normal" },
  { id: 3, startTime: "10:45 AM", endTime: "11:00 AM", slotType: "break" },
  { id: 4, startTime: "11:00 AM", endTime: "11:45 AM", slotType: "normal" },
  { id: 5, startTime: "11:45 AM", endTime: "12:30 PM", slotType: "normal" },
  { id: 6, startTime: "12:30 PM", endTime: "01:15 PM", slotType: "lunch" },
  { id: 7, startTime: "01:15 PM", endTime: "02:00 PM", slotType: "normal" },
  { id: 8, startTime: "02:00 PM", endTime: "02:45 PM", slotType: "normal" },
  { id: 9, startTime: "02:45 PM", endTime: "03:00 PM", slotType: "break" },
  { id: 10, startTime: "03:00 PM", endTime: "03:45 PM", slotType: "normal" },
  { id: 11, startTime: "03:45 PM", endTime: "04:30 PM", slotType: "normal" },
];

const MOCK_SUBJECTS = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Science" },
  { id: 3, name: "English" },
  { id: 4, name: "Tamil" },
  { id: 5, name: "Social Science" },
];

const MOCK_STAFF = [
  { id: 1, name: "Mrs. Priya" },
  { id: 2, name: "Mr. Kumar" },
  { id: 3, name: "Mrs. Anitha" },
  { id: 4, name: "Mr. Raj" },
];

const MOCK_CLASSES = [
  { classId: 1, className: "Class 1" },
  { classId: 2, className: "Class 2" },
  { classId: 3, className: "Class 3" },
];

const MOCK_SECTIONS = {
  1: [{ sectionId: 1, sectionName: "Section A" }, { sectionId: 2, sectionName: "Section B" }],
  2: [{ sectionId: 3, sectionName: "Section A" }],
  3: [{ sectionId: 4, sectionName: "Section A" }, { sectionId: 5, sectionName: "Section B" }],
};

function AdminTimetable() {
  const [selClassId, setSelClassId] = useState("");
  const [selSectionId, setSelSectionId] = useState("");

  /* slots built from mock data — always available on load */
  const slots = mapSlots(MOCK_SLOTS);

  /* grid: { [day]: { [slotId]: { subjectId, staffId, id } } } */
  const [grid, setGrid] = useState(buildEmptyGrid);
  const [origGrid, setOrigGrid] = useState(buildEmptyGrid);

  const sections = MOCK_SECTIONS[selClassId] ?? [];

  const handleLoad = () => {
    if (!selClassId || !selSectionId) {
      toast.error("Please select Class and Section.");
      return;
    }
    toast.info("Grid structure verified. API will be connected next.");
  };

  const handleCellChange = (day, slotId, field, value) => {
    setGrid(prev => {
      const key = String(slotId);
      const prevCell = prev?.[day]?.[key] ?? { id: 0, subjectId: "", staffId: "" };
      return {
        ...prev,
        [day]: { ...(prev?.[day] ?? {}), [key]: { ...prevCell, [field]: normalizeFieldValue(value) } },
      };
    });
  };

  const handleSave = () => {
    toast.info("Save will be connected after API is restored.");
  };

  const handleReset = () => {
    setGrid(JSON.parse(JSON.stringify(origGrid)));
    toast.info("Changes reset.");
  };

  return (
    <div className="tt-root">
      {/* Filter bar */}
      <div className="tt-filter-bar">
        <div className="tt-filter-group">
          <label>Class</label>
          <select value={selClassId} onChange={e => { setSelClassId(e.target.value); setSelSectionId(""); }}>
            <option value="">— Select Class —</option>
            {MOCK_CLASSES.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
          </select>
        </div>
        <div className="tt-filter-group">
          <label>Section</label>
          <select value={selSectionId} onChange={e => setSelSectionId(e.target.value)} disabled={!selClassId}>
            <option value="">— Select Section —</option>
            {sections.map(s => <option key={s.sectionId} value={s.sectionId}>{s.sectionName}</option>)}
          </select>
        </div>
        <button className="tt-load-btn" onClick={handleLoad}>
          <i className="bx bx-refresh"></i> Load Timetable
        </button>
      </div>

      {/* Grid — always visible, built from mock period slots */}
      <div className="tt-grid-scroll">
        <table className="tt-grid-table">
          <thead>
            <tr>
              <th className="tt-th-day-col">Period<br /><span className="tt-th-day-sub">Slot</span></th>
              {DAYS.map(day => (
                <th key={day} className="tt-th-slot" style={{ borderBottomColor: DAY_COLORS[day] }}>
                  <div className="tt-th-slot-num" style={{ color: DAY_COLORS[day] }}>{day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => {
              /* Break / Lunch / Evening Break rows */
              if (slot.isBreak) {
                return (
                  <tr key={slot.id}>
                    <td className="tt-td-day" style={{ borderLeftColor: slot.color }}>
                      <div className="tt-th-slot-num" style={{ color: slot.color }}>{slot.label}</div>
                      <div className="tt-th-slot-time">{slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}</div>
                    </td>
                    {DAYS.map(day => (
                      <td
                        key={`${day}-${slot.id}`}
                        className="tt-td-break"
                        style={{ background: slot.bg, borderLeftColor: slot.color, borderRightColor: slot.color }}
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

              /* Normal period rows — always rendered with empty dropdowns */
              return (
                <tr key={slot.id}>
                  <td className="tt-td-day" style={{ borderLeftColor: "#2d3a8c" }}>
                    <div className="tt-th-slot-num">P{slot.label}</div>
                    <div className="tt-th-slot-time">{slot.startTime}{slot.endTime ? ` - ${slot.endTime}` : ""}</div>
                  </td>
                  {DAYS.map(day => {
                    const cell = getGridCell(grid, day, slot.id) ?? { id: 0, subjectId: "", staffId: "" };
                    return (
                      <td key={`${day}-${slot.id}`} className="tt-td-cell">
                        <div className="tt-cell-inner">
                          <select
                            className="tt-cell-select subject"
                            value={cell.subjectId}
                            onChange={e => handleCellChange(day, slot.id, "subjectId", e.target.value)}
                          >
                            <option value="">Assign Subject</option>
                            {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <div className="tt-cell-teacher-row">
                            <i className="bx bxs-user-circle"></i>
                            <select
                              className="tt-cell-select teacher"
                              value={cell.staffId}
                              onChange={e => handleCellChange(day, slot.id, "staffId", e.target.value)}
                            >
                              <option value="">Assign Teacher</option>
                              {MOCK_STAFF.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
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

      {/* Bottom actions */}
      <div className="tt-bottom-bar">
        <div className="tt-note">
          <i className="bx bx-info-circle"></i>
          <span><strong>Note:</strong> Using mock data — API will be reconnected after structure is verified.</span>
        </div>
        <div className="tt-bottom-actions">
          <button className="tt-hdr-btn outline" onClick={handleReset}>
            <i className="bx bx-reset"></i> Reset
          </button>
          <button className="tt-hdr-btn primary" onClick={handleSave}>
            <i className="bx bxs-save"></i> Save Timetable
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

export default function Timetable() {
  const role = getUserData("role");
  if (role === "Staff") return <StaffTimetable />;
  if (role === "Student") return <StudentTimetable />;
  return <AdminTimetable />;
}
