import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./timetable.css";
import {
  getClass,
  getSection,
  getDay,
  getPeriodSlot,
  getTimeTable,
  getSubject,
  getStafflist,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";

/* ─── constants ─────────────────────────────────────────── */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };
const DAY_COLORS = {
  Monday:    { bg: "#eef0fb", accent: "#2D3A8C", dot: "#2D3A8C" },
  Tuesday:   { bg: "#fdf0eb", accent: "#E8541A", dot: "#E8541A" },
  Wednesday: { bg: "#f0fdf4", accent: "#16a34a", dot: "#16a34a" },
  Thursday:  { bg: "#fef3c7", accent: "#d97706", dot: "#d97706" },
  Friday:    { bg: "#fdf4ff", accent: "#9333ea", dot: "#9333ea" },
  Saturday:  { bg: "#f0f9ff", accent: "#0284c7", dot: "#0284c7" },
};
const CLASS_CARD_COLORS = [
  { bg: "linear-gradient(135deg,#2D3A8C,#3b52b4)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg,#E8541A,#f97316)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg,#16a34a,#22c55e)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg,#9333ea,#a855f7)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg,#0284c7,#38bdf8)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
  { bg: "linear-gradient(135deg,#d97706,#fbbf24)", text: "#fff", badge: "rgba(255,255,255,0.18)" },
];

/* ─── helpers ────────────────────────────────────────────── */
const normTime = (t) => (t || "").replace(/\s/g, "").toLowerCase();

const mapSlots = (list) =>
  Array.isArray(list) && list.length
    ? list.map((s, i) => ({
        id: s.id ?? i + 1,
        label: String(i + 1),
        startTime: s.startTime ?? s["start Time"] ?? "",
        endTime: s.endTime ?? s["end Time"] ?? "",
      }))
    : [
        { id: 1, label: "1", startTime: "9:00",  endTime: "9:45"  },
        { id: 2, label: "2", startTime: "9:45",  endTime: "10:30" },
        { id: 3, label: "3", startTime: "10:45", endTime: "11:30" },
        { id: 4, label: "4", startTime: "11:30", endTime: "12:15" },
        { id: 5, label: "5", startTime: "13:00", endTime: "13:45" },
        { id: 6, label: "6", startTime: "13:45", endTime: "14:30" },
        { id: 7, label: "7", startTime: "14:45", endTime: "15:30" },
        { id: 8, label: "8", startTime: "15:30", endTime: "16:15" },
      ];

const mapDays = (list) =>
  Array.isArray(list) && list.length
    ? list.map((d) => d.day ?? d.name ?? d.dayName ?? String(d))
    : DAYS;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Timetable() {
  const token = getToken();
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState("cards"); // "cards" | "detail"
  const [selectedClass, setSelectedClass] = useState(null); // { classId, sectionId, className, sectionName }

  const [classes, setClasses]   = useState([]);
  const [sections, setSections] = useState([]);
  const [days, setDays]         = useState(DAYS);
  const [slots, setSlots]       = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff]       = useState([]);
  const [timetableRows, setTimetableRows] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [ttLoading, setTtLoading] = useState(false);
  const [search, setSearch]     = useState("");
  const [filterSection, setFilterSection] = useState("");

  /* ── load masters ── */
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const [cls, sec, dayRes, slotRes, subj] = await Promise.all([
          getClass(0, token).catch(() => []),
          getSection(0, token).catch(() => []),
          getDay(token).catch(() => null),
          getPeriodSlot(token).catch(() => null),
          getSubject(0, token).catch(() => []),
        ]);
        const classList    = (Array.isArray(cls)  ? cls  : []).map((c) => ({ id: c.id, name: c.name ?? c.className ?? String(c.id) }));
        const sectionList  = (Array.isArray(sec)  ? sec  : []).map((s) => ({ id: s.id, name: s.name ?? s.sectionName ?? String(s.id) }));
        const subjectList  = (Array.isArray(subj) ? subj : []).map((s) => ({ id: s.id, name: s.name ?? s.subjectName ?? "" }));
        setClasses(classList);
        setSections(sectionList);
        setDays(mapDays(dayRes));
        setSlots(mapSlots(slotRes));
        setSubjects(subjectList);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* ── load timetable when detail view opens ── */
  useEffect(() => {
    if (!selectedClass || view !== "detail") return;
    (async () => {
      setTtLoading(true);
      try {
        const res = await getTimeTable(
          { dayId: 0, classId: selectedClass.classId, sectionId: selectedClass.sectionId },
          token
        );
        setTimetableRows(Array.isArray(res) ? res : []);
      } catch {
        setTimetableRows([]);
      } finally {
        setTtLoading(false);
      }
    })();
  }, [selectedClass, view, token]);

  /* ── class cards (cross-join class × section) ── */
  const classCards = useMemo(() => {
    if (!classes.length || !sections.length) return [];
    return classes.flatMap((c, ci) =>
      sections.map((s, si) => ({
        classId: c.id,
        sectionId: s.id,
        className: c.name,
        sectionName: s.name,
        colorIdx: (ci * sections.length + si) % CLASS_CARD_COLORS.length,
        periodsPerDay: slots.length,
        subjectCount: subjects.length,
      }))
    );
  }, [classes, sections, slots, subjects]);

  const filteredCards = useMemo(() => {
    let list = classCards;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.className.toLowerCase().includes(q) ||
          c.sectionName.toLowerCase().includes(q)
      );
    }
    if (filterSection) list = list.filter((c) => c.sectionName === filterSection);
    return list;
  }, [classCards, search, filterSection]);

  /* ── timetable grid per day ── */
  const gridByDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = {}; });
    timetableRows.forEach((row) => {
      const day   = row.day ?? row.dayName ?? "";
      const start = normTime(row.startTime ?? row["start Time"] ?? "");
      if (day && start) map[day] = map[day] || {};
      if (day && start) map[day][start] = row;
    });
    return map;
  }, [timetableRows]);

  const openDetail = useCallback((card) => {
    setSelectedClass(card);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const uniqueSections = useMemo(() => [...new Set(sections.map((s) => s.name))], [sections]);

  return (
    <div className={`tt2-root${darkMode ? " tt2-dark" : ""}`}>

      {/* ── Top Bar ── */}
      <div className="tt2-topbar">
        <div className="tt2-topbar-left">
          {view === "detail" && (
            <button className="tt2-back-btn" onClick={() => setView("cards")}>
              <i className="bx bx-arrow-back"></i>
            </button>
          )}
          <div>
            <h1 className="tt2-page-title">
              {view === "cards" ? "Class Timetable" : `Class ${selectedClass?.className} – ${selectedClass?.sectionName}`}
            </h1>
            <p className="tt2-page-sub">
              {view === "cards"
                ? `${classCards.length} classes · ${days.length} days/week · ${slots.length} periods/day`
                : "Weekly schedule · Click a day to expand"}
            </p>
          </div>
        </div>
        <div className="tt2-topbar-right">
          <button className="tt2-dark-toggle" onClick={() => setDarkMode((v) => !v)} title="Toggle dark mode">
            <i className={`bx ${darkMode ? "bx-sun" : "bx-moon"}`}></i>
          </button>
        </div>
      </div>

      {/* ── Cards View ── */}
      {view === "cards" && (
        <>
          {/* Search + Filter */}
          <div className="tt2-toolbar">
            <div className="tt2-search">
              <i className="bx bx-search"></i>
              <input
                placeholder="Search class or section…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="tt2-search-clear" onClick={() => setSearch("")}>
                  <i className="bx bx-x"></i>
                </button>
              )}
            </div>
            <div className="tt2-filters">
              <select
                className="tt2-select"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="">All Sections</option>
                {uniqueSections.map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
            <div className="tt2-stats-pills">
              <span className="tt2-pill blue"><i className="bx bxs-school"></i>{classes.length} Classes</span>
              <span className="tt2-pill orange"><i className="bx bx-time-five"></i>{slots.length} Periods</span>
              <span className="tt2-pill green"><i className="bx bxs-book"></i>{subjects.length} Subjects</span>
            </div>
          </div>

          {loading ? (
            <div className="tt2-loading">
              <div className="tt2-spinner"></div>
              <span>Loading classes…</span>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="tt2-empty">
              <i className="bx bx-calendar-x"></i>
              <p>No classes found</p>
            </div>
          ) : (
            <div className="tt2-cards-grid">
              {filteredCards.map((card) => {
                const col = CLASS_CARD_COLORS[card.colorIdx];
                return (
                  <div className="tt2-class-card" key={`${card.classId}-${card.sectionId}`}>
                    {/* Card Header */}
                    <div className="tt2-card-header" style={{ background: col.bg }}>
                      <div className="tt2-card-avatar" style={{ background: col.badge }}>
                        {card.className}
                      </div>
                      <div className="tt2-card-header-info">
                        <span className="tt2-card-title" style={{ color: col.text }}>
                          Class {card.className}
                        </span>
                        <span className="tt2-card-section" style={{ color: col.text, opacity: 0.85 }}>
                          Section {card.sectionName}
                        </span>
                      </div>
                      <div className="tt2-card-badge" style={{ background: col.badge, color: col.text }}>
                        <i className="bx bx-calendar-week"></i>
                        {days.length}d
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="tt2-card-body">
                      <div className="tt2-card-stat">
                        <i className="bx bx-time-five"></i>
                        <span>{card.periodsPerDay} periods/day</span>
                      </div>
                      <div className="tt2-card-stat">
                        <i className="bx bxs-book"></i>
                        <span>{card.subjectCount} subjects</span>
                      </div>
                      <div className="tt2-card-stat">
                        <i className="bx bx-calendar"></i>
                        <span>{days.length} days/week</span>
                      </div>
                      <div className="tt2-card-stat">
                        <i className="bx bxs-user-badge"></i>
                        <span>Class Teacher</span>
                      </div>
                    </div>

                    {/* Day pills */}
                    <div className="tt2-card-days">
                      {days.map((d) => (
                        <span key={d} className="tt2-day-pill">{DAY_SHORT[d] ?? d.slice(0, 3)}</span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="tt2-card-footer">
                      <button className="tt2-view-btn" onClick={() => openDetail(card)}>
                        <i className="bx bx-calendar-check"></i>
                        View Timetable
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Detail View ── */}
      {view === "detail" && selectedClass && (
        <DetailView
          selectedClass={selectedClass}
          days={days}
          slots={slots}
          subjects={subjects}
          gridByDay={gridByDay}
          loading={ttLoading}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════════════════════ */
function DetailView({ selectedClass, days, slots, subjects, gridByDay, loading, darkMode }) {
  const [openDays, setOpenDays] = useState(() => {
    const s = new Set();
    s.add(days[0]);
    return s;
  });
  const [daySearch, setDaySearch] = useState("");

  const toggleDay = (day) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const expandAll   = () => setOpenDays(new Set(days));
  const collapseAll = () => setOpenDays(new Set());

  const subjectName = (row) =>
    row?.subject ?? row?.subjectName ?? "—";

  const teacherName = (row) =>
    row?.teacher ?? row?.teacherName ?? row?.staffName ?? "—";

  const timeLabel = (slot) =>
    slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime;

  if (loading) {
    return (
      <div className="tt2-loading">
        <div className="tt2-spinner"></div>
        <span>Loading timetable…</span>
      </div>
    );
  }

  return (
    <div className="tt2-detail">
      {/* Detail toolbar */}
      <div className="tt2-detail-toolbar">
        <div className="tt2-search" style={{ maxWidth: 280 }}>
          <i className="bx bx-search"></i>
          <input
            placeholder="Search subject or teacher…"
            value={daySearch}
            onChange={(e) => setDaySearch(e.target.value)}
          />
          {daySearch && (
            <button className="tt2-search-clear" onClick={() => setDaySearch("")}>
              <i className="bx bx-x"></i>
            </button>
          )}
        </div>
        <div className="tt2-detail-actions">
          <button className="tt2-ghost-btn" onClick={expandAll}>
            <i className="bx bx-expand-alt"></i> Expand All
          </button>
          <button className="tt2-ghost-btn" onClick={collapseAll}>
            <i className="bx bx-collapse-alt"></i> Collapse All
          </button>
        </div>
        {/* Summary pills */}
        <div className="tt2-stats-pills">
          {days.map((d) => {
            const col = DAY_COLORS[d] || DAY_COLORS.Monday;
            return (
              <span
                key={d}
                className="tt2-pill"
                style={{ background: col.bg, color: col.accent, cursor: "pointer" }}
                onClick={() => toggleDay(d)}
              >
                {DAY_SHORT[d] ?? d.slice(0, 3)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Day sections */}
      <div className="tt2-day-sections">
        {days.map((day) => {
          const col     = DAY_COLORS[day] || DAY_COLORS.Monday;
          const isOpen  = openDays.has(day);
          const dayGrid = gridByDay[day] || {};

          const periods = slots.filter((slot) => {
            const row = dayGrid[normTime(slot.startTime)];
            if (!daySearch.trim()) return true;
            const q = daySearch.toLowerCase();
            return (
              subjectName(row).toLowerCase().includes(q) ||
              teacherName(row).toLowerCase().includes(q)
            );
          });

          const filledCount = slots.filter((s) => dayGrid[normTime(s.startTime)]).length;

          return (
            <div className="tt2-day-section" key={day}>
              {/* Day header (sticky) */}
              <button
                className={`tt2-day-header${isOpen ? " open" : ""}`}
                style={{ borderLeftColor: col.accent }}
                onClick={() => toggleDay(day)}
              >
                <div className="tt2-day-header-left">
                  <span className="tt2-day-dot" style={{ background: col.accent }}></span>
                  <span className="tt2-day-label">{day}</span>
                  <span className="tt2-day-count" style={{ background: col.bg, color: col.accent }}>
                    {filledCount}/{slots.length} periods
                  </span>
                </div>
                <div className="tt2-day-header-right">
                  <span className="tt2-day-progress-wrap">
                    <span
                      className="tt2-day-progress-bar"
                      style={{
                        width: `${slots.length ? (filledCount / slots.length) * 100 : 0}%`,
                        background: col.accent,
                      }}
                    ></span>
                  </span>
                  <i className={`bx bx-chevron-${isOpen ? "up" : "down"} tt2-chevron`}></i>
                </div>
              </button>

              {/* Period cards */}
              {isOpen && (
                <div className="tt2-periods-grid">
                  {periods.map((slot) => {
                    const row = dayGrid[normTime(slot.startTime)];
                    const isEmpty = !row;
                    return (
                      <div
                        className={`tt2-period-card${isEmpty ? " empty" : ""}`}
                        key={slot.id}
                        style={!isEmpty ? { borderTopColor: col.accent } : {}}
                      >
                        <div className="tt2-period-top">
                          <span className="tt2-period-num" style={!isEmpty ? { background: col.bg, color: col.accent } : {}}>
                            P{slot.label}
                          </span>
                          <span className="tt2-period-time">
                            <i className="bx bx-time-five"></i>
                            {timeLabel(slot)}
                          </span>
                          {!isEmpty && (
                            <div className="tt2-period-actions">
                              <button className="tt2-icon-btn edit" title="Edit">
                                <i className="bx bx-edit"></i>
                              </button>
                              <button className="tt2-icon-btn delete" title="Delete">
                                <i className="bx bx-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>

                        {isEmpty ? (
                          <div className="tt2-period-empty-body">
                            <i className="bx bx-plus-circle"></i>
                            <span>Free Period</span>
                          </div>
                        ) : (
                          <div className="tt2-period-body">
                            <div className="tt2-period-subject">
                              <i className="bx bxs-book" style={{ color: col.accent }}></i>
                              <span>{subjectName(row)}</span>
                            </div>
                            <div className="tt2-period-meta">
                              <div className="tt2-period-meta-item">
                                <i className="bx bxs-user"></i>
                                <span>{teacherName(row)}</span>
                              </div>
                              {(row?.classroom ?? row?.room) && (
                                <div className="tt2-period-meta-item">
                                  <i className="bx bxs-map-pin"></i>
                                  <span>{row.classroom ?? row.room}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
