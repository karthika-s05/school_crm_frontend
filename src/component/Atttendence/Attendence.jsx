import React, { useState, useEffect, useCallback } from "react";
import "./Attendence.css";
import "../modules.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getClass,
  getSection,
  getStudentlist,
  createStudentAttendance,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const avatarColors = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];

const Attendence = () => {
  const today = new Date().toISOString().split("T")[0];
  const token = getToken();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [selDate, setSelDate] = useState(today);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec] = await Promise.all([getClass(0, token), getSection(0, token)]);
        const cList = Array.isArray(cls) ? cls : [];
        const sList = Array.isArray(sec) ? sec : [];
        setClasses(cList);
        setSections(sList);
        if (cList[0]) setClassId(String(cList[0].id));
        if (sList[0]) setSectionId(String(sList[0].id));
      } catch {
        toast.error("Failed to load class/section lists");
      }
    };
    if (token) loadMeta();
  }, [token]);

  const loadStudents = useCallback(async () => {
    if (!classId || !sectionId || !token) return;
    setLoading(true);
    await runApi(
      () => getStudentlist({ classId: Number(classId), sectionId: Number(sectionId) }, token),
      {
        onSuccess: (res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setStudents(
            list.map((s) => ({
              id: s.admissionNo || s.studentId,
              name: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
            }))
          );
          setAttendance({});
        },
        onError: () => setStudents([]),
      }
    );
    setLoading(false);
  }, [classId, sectionId, token]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const toggle = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const all = {};
    students.forEach((s) => {
      all[s.id] = status;
    });
    setAttendance(all);
  };

  const presentCount = Object.values(attendance).filter((v) => v === "P").length;
  const absentCount = Object.values(attendance).filter((v) => v === "A").length;
  const unmarked = students.length - presentCount - absentCount;

  const handleSubmit = async () => {
    if (unmarked > 0) {
      toast.warning(`${unmarked} student(s) not marked yet!`);
      return;
    }
    setSubmitting(true);
    const stdAttendance = students.map((s) => ({
      studentId: s.id,
      status: attendance[s.id] === "P",
    }));
    await runApi(
      () =>
        createStudentAttendance(
          {
            classId: Number(classId),
            sectionId: Number(sectionId),
            stdAttendance,
          },
          token
        ),
      {
        successMsg: "Attendance submitted successfully!",
        onSuccess: () => setAttendance({}),
      }
    );
    setSubmitting(false);
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const pct = students.length ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="att-wrap">
      <div className="att-header">
        <div>
          {/* <h2 className="att-title">Student Attendance</h2>
          <p className="att-sub">Mark daily attendance for your class</p> */}
        </div>
        <div className="att-summary-pills">
          <span className="att-pill present">
            <i className="bx bxs-check-circle"></i>
            {presentCount} Present
          </span>
          <span className="att-pill absent">
            <i className="bx bxs-x-circle"></i>
            {absentCount} Absent
          </span>
          <span className="att-pill unmarked">
            <i className="bx bx-time"></i>
            {unmarked} Unmarked
          </span>
        </div>
      </div>

      <div className="att-filters-card">
        <div className="att-filter-group">
          <label>Date</label>
          <input
            type="date"
            value={selDate}
            onChange={(e) => setSelDate(e.target.value)}
            className="att-input"
          />
        </div>
        <div className="att-filter-group">
          <label>Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="att-input"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.className}
              </option>
            ))}
          </select>
        </div>
        <div className="att-filter-group">
          <label>Section</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="att-input"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.sectionName}
              </option>
            ))}
          </select>
        </div>
        <div className="att-filter-group" style={{ justifyContent: "flex-end" }}>
          <label>&nbsp;</label>
          <div className="att-mark-all-btns">
            <button className="att-mark-btn present" onClick={() => markAll("P")}>
              <i className="bx bx-check-double"></i> All Present
            </button>
            <button className="att-mark-btn absent" onClick={() => markAll("A")}>
              <i className="bx bx-x"></i> All Absent
            </button>
          </div>
        </div>
      </div>

      <div className="att-progress-bar-wrap">
        <div className="att-progress-bar">
          <div
            className="att-progress-fill present"
            style={{ width: `${students.length ? (presentCount / students.length) * 100 : 0}%` }}
          ></div>
          <div
            className="att-progress-fill absent"
            style={{ width: `${students.length ? (absentCount / students.length) * 100 : 0}%` }}
          ></div>
        </div>
        <span className="att-progress-label">{pct}% attendance marked</span>
      </div>

      <div className="att-table-card">
        {loading ? (
          <p style={{ padding: 24, textAlign: "center" }}>Loading students…</p>
        ) : (
          <table className="att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Adm. No</th>
                <th style={{ textAlign: "center" }}>Present</th>
                <th style={{ textAlign: "center" }}>Absent</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                    No students found for this class/section
                  </td>
                </tr>
              ) : (
                students.map((s, i) => {
                  const status = attendance[s.id];
                  return (
                    <tr
                      key={s.id}
                      className={
                        status === "P" ? "row-present" : status === "A" ? "row-absent" : ""
                      }
                    >
                      <td className="att-num">{i + 1}</td>
                      <td>
                        <div className="att-student-cell">
                          <div
                            className="att-avatar"
                            style={{ background: avatarColors[i % avatarColors.length] }}
                          >
                            {getInitials(s.name)}
                          </div>
                          <span className="att-name">{s.name}</span>
                        </div>
                      </td>
                      <td className="att-adm">{s.id}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`att-toggle-btn present${status === "P" ? " selected" : ""}`}
                          onClick={() => toggle(s.id, "P")}
                        >
                          <i className="bx bx-check"></i>
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`att-toggle-btn absent${status === "A" ? " selected" : ""}`}
                          onClick={() => toggle(s.id, "A")}
                        >
                          <i className="bx bx-x"></i>
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {status === "P" && (
                          <span className="att-status-badge present">Present</span>
                        )}
                        {status === "A" && (
                          <span className="att-status-badge absent">Absent</span>
                        )}
                        {!status && <span className="att-status-badge unmarked"></span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="att-footer">
        <button className="att-cancel-btn" onClick={() => setAttendance({})}>
          <i className="bx bx-reset"></i> Reset
        </button>
        <button
          className="att-submit-btn"
          onClick={handleSubmit}
          disabled={submitting || students.length === 0}
        >
          <i className="bx bx-send"></i> {submitting ? "Submitting…" : "Submit Attendance"}
        </button>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default Attendence;
