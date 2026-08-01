import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import {
  getClass,
  getSection,
  getStudentAttendanceContextV2,
  getStudentTodayPeriodsV2,
  getMyClassTeacherClassesV2,
  saveStudentAttendanceV2,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import {
  STUDENT_STATUSES,
  countByStatus,
  normalizeStatus,
  personName,
  todayISO,
} from "./constants";
import AttendanceMarkingTable from "./components/AttendanceMarkingTable";
import { AttendanceSummaryPills } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup, FilterSelect, toOptions } from "./components/AttendanceFilterBar";
import { LoadingState, EmptyState, ErrorState } from "./components/AttendanceStates";

const normalizeRoster = (data) => {
  const list = Array.isArray(data) ? data : data?.students || data?.roster || [];
  return list.map((s) => ({
    id: s.studentId ?? s.admissionNo ?? s.id,
    name: personName(s),
    subLabel: s.admissionNo ?? s.studentId ?? "-",
    status: normalizeStatus(s.status),
    remarks: s.remarks || "",
  }));
};

const normalizePeriods = (data) => {
  const list = Array.isArray(data) ? data : data?.periods || [];
  return list.map((p, i) => ({
    key: p.timetableId ?? p.id ?? i,
    timetableId: p.timetableId ?? p.id,
    periodId: p.periodId ?? p.periodSlotId ?? p.slotId ?? p.id,
    label: p.periodName || p.period || (p.periodNo ? `Period ${p.periodNo}` : `Period ${i + 1}`),
    time: [p.startTime, p.endTime].filter(Boolean).join(" – "),
    classId: p.classId,
    className: p.className || (p.classId ? `Class ${p.classId}` : ""),
    sectionId: p.sectionId,
    sectionName: p.sectionName || "",
    subjectId: p.subjectId,
    subjectName: p.subjectName || p.subject || "",
    assigned: p.isAssigned !== false && p.assigned !== false,
    marked: p.isMarked === true || p.marked === true || p.attendanceMarked === true,
  }));
};

/**
 * Student attendance entry for Staff / Admin.
 * - Daily mode (class teacher): pick class/section/date, load roster, mark.
 * - Period mode (subject teacher): today's timetable period cards; clicking an
 *   assigned period auto-loads the roster for that class/section/subject/period.
 */
const StudentAttendanceEntry = () => {
  const token = getToken();
  const role = String(getUserData("role") || "").trim().toLowerCase();
  const isStaff = role === "staff";
  const [mode, setMode] = useState("daily");

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]); // staff class-teacher maps
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayISO());

  const [periods, setPeriods] = useState([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [periodsError, setPeriodsError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(true);
  const [lockReason, setLockReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    const loadMeta = async () => {
      try {
        if (isStaff) {
          const res = await getMyClassTeacherClassesV2(token);
          const list = Array.isArray(res?.data) ? res.data : [];
          setAssignments(list);
          const classOpts = [];
          const seenClass = new Set();
          list.forEach((row) => {
            const id = String(row.classId);
            if (!seenClass.has(id)) {
              seenClass.add(id);
              classOpts.push({
                id,
                name: row.className || `Class ${row.classId}`,
              });
            }
          });
          setClasses(classOpts);
          if (classOpts.length === 1) {
            setClassId(classOpts[0].id);
          }
          if (!list.length) {
            toast.info(
              "No class teacher mapping found. Ask admin to map you under Class Teacher."
            );
          }
          return;
        }

        const [cls, sec] = await Promise.all([getClass(0, token), getSection(0, token)]);
        setClasses(toOptions(cls, ["name", "className"]));
        setSections(toOptions(sec, ["name", "sectionName"]));
      } catch {
        toast.error("Failed to load class/section lists");
      }
    };
    loadMeta();
  }, [token, isStaff]);

  // Staff: sections depend on selected class from their assignments
  useEffect(() => {
    if (!isStaff) return;
    if (!classId) {
      setSections([]);
      setSectionId("");
      return;
    }
    const sectionOpts = [];
    const seen = new Set();
    assignments
      .filter((row) => String(row.classId) === String(classId))
      .forEach((row) => {
        const id = String(row.sectionId);
        if (!seen.has(id)) {
          seen.add(id);
          sectionOpts.push({
            id,
            name: row.sectionName || `Section ${row.sectionId}`,
          });
        }
      });
    setSections(sectionOpts);
    setSectionId((prev) => {
      if (sectionOpts.length === 1) return sectionOpts[0].id;
      if (sectionOpts.some((s) => s.id === prev)) return prev;
      return "";
    });
  }, [isStaff, classId, assignments]);

  const loadContext = useCallback(
    async (ctx) => {
      setLoading(true);
      setError("");
      const ok = await runApi(
        () => getStudentAttendanceContextV2(ctx, token),
        {
          onSuccess: (res) => {
            setRows(normalizeRoster(res.data));
            // canMark lives inside data; canEdit is top-level from sendOk.
            const allowed =
              res.data?.canMark === true || res.canEdit === true;
            setCanEdit(allowed);
            setLockReason(
              allowed
                ? ""
                : res.data?.alreadyMarked
                  ? "Attendance for this selection is already marked and you cannot modify it."
                  : "Only the assigned class teacher (or admin) can mark daily attendance for this class/section."
            );
          },
          onError: () => {
            setRows([]);
            setCanEdit(false);
            setLockReason("");
            setError("Could not load the student roster.");
          },
        }
      );
      setLoading(false);
      return ok;
    },
    [token]
  );

  // Daily mode: load roster when class/section/date are chosen
  useEffect(() => {
    if (mode !== "daily" || !classId || !sectionId || !date || !token) return;
    loadContext({
      mode: "daily",
      date,
      classId: Number(classId),
      sectionId: Number(sectionId),
    });
  }, [mode, classId, sectionId, date, token, loadContext]);

  // Period mode: load today's periods
  const loadPeriods = useCallback(async () => {
    setPeriodsLoading(true);
    setPeriodsError("");
    await runApi(() => getStudentTodayPeriodsV2(token), {
      onSuccess: (res) => setPeriods(normalizePeriods(res.data)),
      onError: () => {
        setPeriods([]);
        setPeriodsError("Could not load today's timetable periods.");
      },
    });
    setPeriodsLoading(false);
  }, [token]);

  useEffect(() => {
    if (mode === "period" && token) {
      setSelectedPeriod(null);
      setRows([]);
      loadPeriods();
    }
  }, [mode, token, loadPeriods]);

  const handlePeriodClick = (p) => {
    if (!p.assigned) return;
    setSelectedPeriod(p);
    loadContext({
      mode: "period",
      date: todayISO(),
      classId: Number(p.classId),
      sectionId: Number(p.sectionId),
      subjectId: p.subjectId ? Number(p.subjectId) : undefined,
      periodSlotId: p.periodId ? Number(p.periodId) : undefined,
      timetableId: p.timetableId ? Number(p.timetableId) : undefined,
    });
  };

  const handleRowChange = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleMarkAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    const unmarked = rows.filter((r) => !normalizeStatus(r.status)).length;
    if (unmarked > 0) {
      toast.warning(`${unmarked} student(s) not marked yet`);
      return;
    }
    const base =
      mode === "daily"
        ? { mode: "daily", date, classId: Number(classId), sectionId: Number(sectionId) }
        : {
            mode: "period",
            date: todayISO(),
            classId: Number(selectedPeriod.classId),
            sectionId: Number(selectedPeriod.sectionId),
            subjectId: selectedPeriod.subjectId ? Number(selectedPeriod.subjectId) : undefined,
            periodSlotId: selectedPeriod.periodId ? Number(selectedPeriod.periodId) : undefined,
            timetableId: selectedPeriod.timetableId ? Number(selectedPeriod.timetableId) : undefined,
          };
    setSaving(true);
    await runApi(
      () =>
        saveStudentAttendanceV2(
          {
            ...base,
            students: rows.map((r) => ({
              studentId: r.id,
              status: r.status,
              remarks: r.remarks || "",
            })),
          },
          token
        ),
      {
        successMsg: "Attendance saved successfully",
        onError: (err) =>
          toast.error(err?.response?.data?.message || err?.message || "Failed to save attendance"),
      }
    );
    setSaving(false);
  };

  const counts = countByStatus(rows, STUDENT_STATUSES);
  const rosterVisible = mode === "daily" || (mode === "period" && selectedPeriod);

  return (
    <div className="av2-wrap">

      <div className="av2-tabs">
        <button
          type="button"
          className={`av2-tab${mode === "daily" ? " active" : ""}`}
          onClick={() => setMode("daily")}
        >
          <i className="bx bx-calendar-check"></i> Daily (Class Teacher)
        </button>
        <button
          type="button"
          className={`av2-tab${mode === "period" ? " active" : ""}`}
          onClick={() => setMode("period")}
        >
          <i className="bx bx-time-five"></i> Subject Period
        </button>
      </div>

      {mode === "daily" && (
        <AttendanceFilterBar>
          <FilterGroup label="Date">
            <input
              type="date"
              className="av2-input"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </FilterGroup>
          <FilterGroup label="Class">
            <FilterSelect value={classId} onChange={setClassId} options={classes} placeholder="Select class" />
          </FilterGroup>
          <FilterGroup label="Section">
            <FilterSelect value={sectionId} onChange={setSectionId} options={sections} placeholder="Select section" />
          </FilterGroup>
        </AttendanceFilterBar>
      )}

      {mode === "period" && (
        <div className="av2-panel">
          <h3><i className="bx bx-calendar" style={{ color: "#2d3a8c" }}></i>Today's Periods</h3>
          {periodsLoading ? (
            <LoadingState text="Loading today's timetable…" />
          ) : periodsError ? (
            <ErrorState text={periodsError} onRetry={loadPeriods} />
          ) : periods.length === 0 ? (
            <EmptyState text="No periods assigned to you today" icon="bx bx-calendar-x" />
          ) : (
            <div className="av2-period-grid">
              {periods.map((p) => (
                <button
                  type="button"
                  key={p.key}
                  className={`av2-period-card${selectedPeriod?.key === p.key ? " selected" : ""}`}
                  onClick={() => handlePeriodClick(p)}
                  disabled={!p.assigned}
                  title={p.assigned ? "Mark attendance for this period" : "Not assigned to you"}
                >
                  <div className="av2-period-top">
                    <span className="av2-period-name">{p.label}</span>
                    <span className="av2-period-time">{p.time}</span>
                  </div>
                  <span className="av2-period-subject">{p.subjectName || "-"}</span>
                  <span className="av2-period-class">
                    {p.className}{p.sectionName ? ` · ${p.sectionName}` : ""}
                  </span>
                  {p.marked ? (
                    <span className="av2-period-tag" style={{ background: "#dcfce7", color: "#16a34a" }}>
                      Marked
                    </span>
                  ) : p.assigned ? (
                    <span className="av2-period-tag" style={{ background: "#eef0fb", color: "#2d3a8c" }}>
                      Tap to mark
                    </span>
                  ) : (
                    <span className="av2-period-tag" style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                      Not assigned
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {rosterVisible && (
        <>
          <AttendanceMarkingTable
            rows={rows}
            statuses={STUDENT_STATUSES}
            onChange={handleRowChange}
            onMarkAll={handleMarkAll}
            loading={loading}
            error={error}
            onRetry={() =>
              mode === "daily"
                ? loadContext({ mode: "daily", date, classId: Number(classId), sectionId: Number(sectionId) })
                : selectedPeriod && handlePeriodClick(selectedPeriod)
            }
            emptyText={
              mode === "daily"
                ? "Select a class and section to load students"
                : "No students found for this period"
            }
            subLabelHeader="Adm. No"
          />

          {!canEdit && rows.length > 0 && (
            <div className="av2-state" style={{ padding: "8px 0", flexDirection: "row" }}>
              <i className="bx bx-lock-alt" style={{ fontSize: 18 }}></i>
              {lockReason ||
                "Attendance for this selection is locked and cannot be modified."}
            </div>
          )}

          <div className="av2-footer">
            <button
              type="button"
              className="av2-btn av2-btn-ghost"
              onClick={() => setRows((prev) => prev.map((r) => ({ ...r, status: "", remarks: "" })))}
              disabled={rows.length === 0}
            >
              <i className="bx bx-reset"></i> Reset
            </button>
            <button
              type="button"
              className="av2-btn av2-btn-primary"
              onClick={handleSave}
              disabled={saving || rows.length === 0 || !canEdit}
            >
              <i className="bx bx-send"></i> {saving ? "Saving…" : "Save Attendance"}
            </button>
          </div>
        </>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default StudentAttendanceEntry;
