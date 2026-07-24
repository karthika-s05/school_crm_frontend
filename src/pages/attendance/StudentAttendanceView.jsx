import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import {
  editStudentAttendanceV2,
  getClass,
  getPeriodSlot,
  getSection,
  getStudentAttendanceViewV2,
  getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import {
  STUDENT_STATUSES,
  countByStatus,
  normalizeStatus,
  personName,
  todayISO,
} from "./constants";
import AttendanceHistoryTable from "./components/AttendanceHistoryTable";
import { AttendanceSummaryPills } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup, FilterSelect, toOptions } from "./components/AttendanceFilterBar";
import EditAttendanceModal from "./components/EditAttendanceModal";

const toDateStr = (value) => String(value || "").slice(0, 10) || "-";

// The backend returns one "session" per marked header (class/period) with a
// nested students array; flatten it into one row per student.
const normalizeRecords = (data) => {
  const sessions = Array.isArray(data) ? data : data?.records || data?.sessions || [];
  const rows = [];
  sessions.forEach((session, si) => {
    const students = Array.isArray(session.students) ? session.students : [session];
    const period =
      [session.startTime, session.endTime].filter(Boolean).join(" – ") ||
      (session.periodSlotId ? `Period ${session.periodSlotId}` : "-");
    students.forEach((r, i) => {
      rows.push({
        id: `${session.attendanceId ?? si}-${r.studentId ?? i}`,
        attendanceId: session.attendanceId,
        studentId: r.studentId ?? r.admissionNo,
        name: personName(r),
        subLabel: r.admissionNo ?? r.studentId ?? "-",
        date: toDateStr(session.date || session.attendanceDate),
        extra: {
          class: [session.className, session.sectionName].filter(Boolean).join(" - ") || "-",
          subject:
            Number(session.subjectId) === 0
              ? "Daily"
              : session.subjectName || `Subject ${session.subjectId}`,
          period: Number(session.periodSlotId) === 0 ? "-" : period,
        },
        status: normalizeStatus(r.status),
        remarks: r.remarks || "",
        canEdit: session.canEdit === true,
        raw: r,
      });
    });
  });
  return rows;
};

/**
 * Enhanced view of student attendance for Staff / Admin with
 * date, class, section, subject and period filters. Rows are editable
 * only when the backend flags them with canEdit.
 */
const StudentAttendanceView = () => {
  const token = getToken();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periodSlots, setPeriodSlots] = useState([]);

  const [date, setDate] = useState(todayISO());
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!token) return;
    const loadMeta = async () => {
      try {
        const [cls, sec, sub] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getSubject(0, token),
        ]);
        setClasses(toOptions(cls, ["name", "className"]));
        setSections(toOptions(sec, ["name", "sectionName"]));
        setSubjects(toOptions(sub, ["name", "subjectName"]));
      } catch {
        toast.error("Failed to load filter options");
      }
    };
    loadMeta();
  }, [token]);

  // Period slots depend on the selected class
  useEffect(() => {
    if (!token || !classId) {
      setPeriodSlots([]);
      setPeriodId("");
      return;
    }
    getPeriodSlot(Number(classId), token)
      .then((slots) =>
        setPeriodSlots(
          (Array.isArray(slots) ? slots : []).map((p) => ({
            id: p.id,
            name: p.periodName || p.name || `Period ${p.periodNo ?? p.id}`,
          }))
        )
      )
      .catch(() => setPeriodSlots([]));
  }, [token, classId]);

  const loadRecords = useCallback(async () => {
    if (!token || !classId || !sectionId || !date) return;
    setLoading(true);
    setError("");
    await runApi(
      () =>
        getStudentAttendanceViewV2(
          {
            date,
            classId: Number(classId),
            sectionId: Number(sectionId),
            subjectId: subjectId ? Number(subjectId) : undefined,
            periodSlotId: periodId ? Number(periodId) : undefined,
          },
          token
        ),
      {
        onSuccess: (res) => setRecords(normalizeRecords(res.data)),
        onError: () => {
          setRecords([]);
          setError("Could not load attendance records.");
        },
      }
    );
    setLoading(false);
  }, [token, date, classId, sectionId, subjectId, periodId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleEditSave = async ({ status, remarks }) => {
    const r = editing;
    const ok = await runApi(
      () =>
        editStudentAttendanceV2(
          {
            attendanceId: r.attendanceId,
            students: [{ studentId: r.studentId, status, remarks }],
          },
          token
        ),
      {
        successMsg: "Attendance updated",
        onError: (err) =>
          toast.error(err?.response?.data?.message || err?.message || "Failed to update record"),
      }
    );
    if (ok) {
      setEditing(null);
      loadRecords();
    }
  };

  const counts = countByStatus(records, STUDENT_STATUSES);

  return (
    <div className="av2-wrap">

      <AttendanceFilterBar>
        <FilterGroup label="Date">
          <input
            type="date"
            className="av2-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup label="Class">
          <FilterSelect value={classId} onChange={setClassId} options={classes} placeholder="Select class" />
        </FilterGroup>
        <FilterGroup label="Section">
          <FilterSelect value={sectionId} onChange={setSectionId} options={sections} placeholder="Select section" />
        </FilterGroup>
        <FilterGroup label="Subject">
          <FilterSelect value={subjectId} onChange={setSubjectId} options={subjects} placeholder="All / Daily" />
        </FilterGroup>
        <FilterGroup label="Period">
          <FilterSelect
            value={periodId}
            onChange={setPeriodId}
            options={periodSlots}
            placeholder="All periods"
            disabled={!classId}
          />
        </FilterGroup>
        <button type="button" className="av2-btn av2-btn-primary" onClick={loadRecords}>
          <i className="bx bx-search"></i> Apply
        </button>
      </AttendanceFilterBar>

      <AttendanceHistoryTable
        rows={records}
        columns={[
          { key: "class", header: "Class" },
          { key: "subject", header: "Subject" },
          { key: "period", header: "Period" },
        ]}
        onEdit={(r) => setEditing(r)}
        loading={loading}
        error={error}
        onRetry={loadRecords}
        emptyText={
          classId && sectionId
            ? "No attendance records for the selected filters"
            : "Select a class and section to view records"
        }
        subLabelHeader="Adm. No"
        searchPlaceholder="Search student or adm. no…"
      />

      {editing && (
        <EditAttendanceModal
          record={editing}
          statuses={STUDENT_STATUSES}
          onSave={handleEditSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default StudentAttendanceView;
