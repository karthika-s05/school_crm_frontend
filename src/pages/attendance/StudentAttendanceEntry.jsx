import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import {
  getClass,
  getSection,
  getStudentAttendanceContextV2,
  getMyClassTeacherClassesV2,
  saveStudentAttendanceV2,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import {
  STUDENT_STATUSES,
  normalizeStatus,
  personName,
  todayISO,
} from "./constants";
import AttendanceMarkingTable from "./components/AttendanceMarkingTable";
import { AttendanceFilterBar, FilterGroup, FilterSelect, toOptions } from "./components/AttendanceFilterBar";
import { LoadingState } from "./components/AttendanceStates";

const SESSIONS = [
  { key: "morning",   label: "Morning",   icon: "bx bx-sun" },
  { key: "afternoon", label: "Afternoon", icon: "bx bx-cloud-sun" },
];

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

const StudentAttendanceEntry = () => {
  const token = getToken();
  const role = String(getUserData("role") || "").trim().toLowerCase();
  const isStaff = role === "staff";

  const [session, setSession] = useState("morning");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(todayISO());

  // Per-session state: { morning: {rows, canEdit, lockReason, error}, afternoon: {...} }
  const [sessionData, setSessionData] = useState({
    morning:   { rows: [], canEdit: true, lockReason: "", error: "" },
    afternoon: { rows: [], canEdit: true, lockReason: "", error: "" },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const rows       = sessionData[session].rows;
  const canEdit    = sessionData[session].canEdit;
  const lockReason = sessionData[session].lockReason;
  const error      = sessionData[session].error;

  const setSessionField = (sess, patch) =>
    setSessionData((prev) => ({ ...prev, [sess]: { ...prev[sess], ...patch } }));

  // Load class/section meta
  useEffect(() => {
    if (!token) return;
    const loadMeta = async () => {
      try {
        if (isStaff) {
          const res = await getMyClassTeacherClassesV2(token);
          const list = Array.isArray(res?.data) ? res.data : [];
          setAssignments(list);
          const classOpts = [];
          const seen = new Set();
          list.forEach((row) => {
            const id = String(row.classId);
            if (!seen.has(id)) {
              seen.add(id);
              classOpts.push({ id, name: row.className || `Class ${row.classId}` });
            }
          });
          setClasses(classOpts);
          if (classOpts.length === 1) setClassId(classOpts[0].id);
          if (!list.length)
            toast.info("No class teacher mapping found. Ask admin to map you under Class Teacher.");
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

  // Staff: sections depend on selected class
  useEffect(() => {
    if (!isStaff) return;
    if (!classId) { setSections([]); setSectionId(""); return; }
    const opts = [];
    const seen = new Set();
    assignments
      .filter((row) => String(row.classId) === String(classId))
      .forEach((row) => {
        const id = String(row.sectionId);
        if (!seen.has(id)) {
          seen.add(id);
          opts.push({ id, name: row.sectionName || `Section ${row.sectionId}` });
        }
      });
    setSections(opts);
    setSectionId((prev) => {
      if (opts.length === 1) return opts[0].id;
      if (opts.some((s) => s.id === prev)) return prev;
      return "";
    });
  }, [isStaff, classId, assignments]);

  const loadContext = useCallback(
    async (ctx, sess) => {
      setLoading(true);
      setSessionField(sess, { error: "" });
      await runApi(() => getStudentAttendanceContextV2(ctx, token), {
        onSuccess: (res) => {
          const allowed = res.data?.canMark === true || res.canEdit === true;
          setSessionField(sess, {
            rows: normalizeRoster(res.data),
            canEdit: allowed,
            lockReason: allowed
              ? ""
              : res.data?.alreadyMarked
              ? "Attendance for this session is already marked and cannot be modified."
              : "Only the assigned class teacher (or admin) can mark attendance for this class/section.",
            error: "",
          });
        },
        onError: () => {
          setSessionField(sess, { rows: [], canEdit: false, lockReason: "", error: "Could not load the student roster." });
        },
      });
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  // Reload roster for BOTH sessions when class/section/date change
  useEffect(() => {
    if (!classId || !sectionId || !date || !token) return;
    const ctx = { mode: "daily", date, classId: Number(classId), sectionId: Number(sectionId) };
    loadContext({ ...ctx, session: "morning" },   "morning");
    loadContext({ ...ctx, session: "afternoon" }, "afternoon");
  }, [classId, sectionId, date, token, loadContext]);

  const handleRowChange = (id, patch) =>
    setSessionField(session, {
      rows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });

  const handleMarkAll = (status) =>
    setSessionField(session, { rows: rows.map((r) => ({ ...r, status })) });

  const handleSave = async () => {
    const unmarked = rows.filter((r) => !normalizeStatus(r.status)).length;
    if (unmarked > 0) { toast.warning(`${unmarked} student(s) not marked yet`); return; }
    setSaving(true);
    await runApi(
      () =>
        saveStudentAttendanceV2(
          {
            mode: "daily",
            session,
            date,
            classId: Number(classId),
            sectionId: Number(sectionId),
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

  const rosterVisible = !!(classId && sectionId);

  return (
    <div className="av2-wrap">

      {/* Session tabs */}
      <div className="av2-tabs">
        {SESSIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`av2-tab${session === s.key ? " active" : ""}`}
            onClick={() => setSession(s.key)}
          >
            <i className={s.icon}></i> {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
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

      {/* Roster table */}
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
              loadContext(
                { mode: "daily", session, date, classId: Number(classId), sectionId: Number(sectionId) },
                session
              )
            }
            emptyText="Select a class and section to load students"
            subLabelHeader="Adm. No"
          />

          {!canEdit && rows.length > 0 && (
            <div className="av2-state" style={{ padding: "8px 0", flexDirection: "row" }}>
              <i className="bx bx-lock-alt" style={{ fontSize: 18 }}></i>
              {lockReason || "Attendance for this session is locked and cannot be modified."}
            </div>
          )}

          <div className="av2-footer">
            <button
              type="button"
              className="av2-btn av2-btn-ghost"
              onClick={() => setSessionField(session, { rows: rows.map((r) => ({ ...r, status: "", remarks: "" })) })}
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
