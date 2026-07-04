import React, { useState, useEffect, useMemo, useCallback } from "react";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./timetable.css";
import {
  getClass,
  getSection,
  getDay,
  getPeriodSlot,
  getTimeTable,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { toast } from "react-toastify";

const FALLBACK_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const FALLBACK_SLOTS = [
  { key: "p1", label: "1", type: "period", startTime: "9:00 – 9:45" },
  { key: "p2", label: "2", type: "period", startTime: "9:45 – 10:30" },
  { key: "break1", label: "Break", type: "break" },
  { key: "p3", label: "3", type: "period", startTime: "10:45 – 11:30" },
  { key: "p4", label: "4", type: "period", startTime: "11:30 – 12:15" },
  { key: "lunch", label: "Lunch", type: "lunch" },
  { key: "p5", label: "5", type: "period", startTime: "1:00 – 1:45" },
  { key: "p6", label: "6", type: "period", startTime: "1:45 – 2:30" },
  { key: "break2", label: "Break", type: "break" },
  { key: "p7", label: "7", type: "period", startTime: "2:45 – 3:30" },
  { key: "p8", label: "8", type: "period", startTime: "3:30 – 4:15" },
];

const normTime = (t) => (t || "").replace(/\s/g, "").toLowerCase();

const mapPeriodSlots = (list) => {
  if (!Array.isArray(list) || !list.length) return null;
  return list.map((slot, i) => ({
    key: `p${slot.id ?? i + 1}`,
    label: String(i + 1),
    type: "period",
    startTime: slot.startTime ?? slot["start Time"] ?? "",
    endTime: slot.endTime ?? slot["end Time"] ?? "",
    periodSlotId: slot.id,
  }));
};

const mapDays = (list) => {
  if (!Array.isArray(list) || !list.length) return FALLBACK_DAYS;
  return list.map((d) => d.day ?? d.name ?? d.dayName ?? String(d));
};

export default function Timetable() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [days, setDays] = useState(FALLBACK_DAYS);
  const [slots, setSlots] = useState(FALLBACK_SLOTS);
  const [timetableRows, setTimetableRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const clsLabel = useMemo(() => {
    const c = classes.find((x) => x.id === classId);
    const s = sections.find((x) => x.id === sectionId);
    if (c && s) return `${c.name}-${s.name}`;
    return "—";
  }, [classes, sections, classId, sectionId]);

  const subjectGrid = useMemo(() => {
    const grid = {};
    timetableRows.forEach((row) => {
      const day = row.day ?? row.dayName;
      const start = normTime(row.startTime ?? row["start Time"]);
      if (day && start) grid[`${day}|${start}`] = row.subject ?? "—";
    });
    return grid;
  }, [timetableRows]);

  const getCellSubject = useCallback((day, slot) => {
    if (slot.type !== "period") return null;
    const start = normTime(slot.startTime);
    return subjectGrid[`${day}|${start}`] ?? null;
  }, [subjectGrid]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadMasters = async () => {
      setLoading(true);
      try {
        const [classRes, sectionRes, dayRes, slotRes] = await Promise.all([
          getClass(0, token).catch(() => []),
          getSection(0, token).catch(() => []),
          getDay(token).catch(() => null),
          getPeriodSlot(token).catch(() => null),
        ]);

        const classList = (Array.isArray(classRes) ? classRes : []).map((c) => ({
          id: c.id,
          name: c.name ?? c.className ?? String(c.id),
        }));
        const sectionList = (Array.isArray(sectionRes) ? sectionRes : []).map((s) => ({
          id: s.id,
          name: s.name ?? s.sectionName ?? String(s.id),
        }));

        setClasses(classList);
        setSections(sectionList);
        if (classList.length) setClassId(classList[0].id);
        if (sectionList.length) setSectionId(sectionList[0].id);

        setDays(mapDays(dayRes));
        const mappedSlots = mapPeriodSlots(slotRes);
        if (mappedSlots) setSlots(mappedSlots);
      } catch {
        toast.error("Could not load timetable master data");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token || !classId || !sectionId) return;

    const loadTimetable = async () => {
      try {
        const res = await getTimeTable(
          { dayId: 0, classId, sectionId },
          token
        );
        setTimetableRows(Array.isArray(res) ? res : []);
      } catch {
        toast.error("Could not load class timetable");
        setTimetableRows([]);
      }
    };

    loadTimetable();
  }, [classId, sectionId]);

  const handleClassChange = (e) => {
    const val = e.target.value;
    const [cId, sId] = val.split("-").map(Number);
    setClassId(cId);
    setSectionId(sId);
  };

  const classOptions = useMemo(() => {
    if (!classes.length || !sections.length) return [];
    return classes.flatMap((c) =>
      sections.map((s) => ({
        key: `${c.id}-${s.id}`,
        value: `${c.id}-${s.id}`,
        label: `${c.name}-${s.name}`,
      }))
    );
  }, [classes, sections]);

  const periodCount = slots.filter((s) => s.type === "period").length;

  return (
    <div className="sdl-wrap tt-wrap">
      <div className="sdl-header">
        <div>
          <h2 className="sdl-title">Period Time Table</h2>
          <p className="sdl-sub">Weekly schedule — days on the left, periods across</p>
        </div>
        <select
          className="svc-select"
          value={classId && sectionId ? `${classId}-${sectionId}` : ""}
          onChange={handleClassChange}
          disabled={!classOptions.length}
        >
          {classOptions.length ? (
            classOptions.map((o) => (
              <option key={o.key} value={o.value}>
                Class {o.label}
              </option>
            ))
          ) : (
            <option value="">No classes</option>
          )}
        </select>
      </div>

      <div className="tt-meta">
        <span className="tt-meta-pill">
          <i className="bx bxs-school"></i> Class {clsLabel}
        </span>
        <span className="tt-meta-pill">
          <i className="bx bx-calendar"></i> {days.length} days / week
        </span>
        <span className="tt-meta-pill">
          <i className="bx bx-time-five"></i> {periodCount} periods
        </span>
      </div>

      {loading ? (
        <div className="sdl-empty" style={{ padding: 48 }}>
          <i className="bx bx-loader-alt bx-spin"></i>
          <span>Loading timetable…</span>
        </div>
      ) : (
        <div className="tt-table-scroll">
          <table className="tt-table">
            <thead>
              <tr>
                <th className="tt-day-col tt-corner">Day</th>
                {slots.map((slot) =>
                  slot.type === "period" ? (
                    <th key={slot.key} className="tt-period-head">
                      <span className="tt-period-num">P{slot.label}</span>
                      <span className="tt-period-time">
                        {slot.endTime
                          ? `${slot.startTime} – ${slot.endTime}`
                          : slot.startTime}
                      </span>
                    </th>
                  ) : (
                    <th
                      key={slot.key}
                      className={`tt-slot-head tt-slot-head--${slot.type}`}
                    >
                      {slot.label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <th className="tt-day-col" scope="row">
                    <span className="tt-day-name">{day}</span>
                    <span className="tt-day-short">{day.slice(0, 3)}</span>
                  </th>
                  {slots.map((slot) => {
                    if (slot.type === "break") {
                      return (
                        <td key={slot.key} className="tt-cell tt-cell--break">
                          <i className="bx bx-coffee"></i>
                        </td>
                      );
                    }
                    if (slot.type === "lunch") {
                      return (
                        <td key={slot.key} className="tt-cell tt-cell--lunch">
                          <i className="bx bx-restaurant"></i>
                        </td>
                      );
                    }
                    const subject = getCellSubject(day, slot);
                    return (
                      <td key={slot.key} className="tt-cell tt-cell--subject">
                        {subject}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="tt-legend">
        <span><i className="bx bx-book-open"></i> Subject period</span>
        <span><i className="bx bx-coffee"></i> Short break</span>
        <span><i className="bx bx-restaurant"></i> Lunch</span>
      </div>
    </div>
  );
}
