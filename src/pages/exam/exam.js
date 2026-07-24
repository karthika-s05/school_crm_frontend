import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import {
  createExamreport,
  getAcademicYear,
  getExam,
  getClass,
  getSection,
  getSubject,
  getStudentlist,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const ROW_COUNT = 6;

const calculateRemark = (mark) => {
  if (mark === "" || mark === null) return "";
  const n = parseInt(mark, 10);
  if (isNaN(n)) return "";
  if (n < 40) return "Below Average";
  if (n <= 75) return "Average";
  return "Good";
};

export default function Examreport() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const role = String(getUserData("role") || "").toLowerCase();
  const portalBase = useMemo(() => {
    if (location.pathname.startsWith("/staff")) return "/staff";
    if (role === "staff") return "/staff";
    return "/admin";
  }, [location.pathname, role]);
  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [subjectsError, setSubjectsError] = useState("");
  const [rows, setRows] = useState(
    Array.from({ length: ROW_COUNT }, () => ({ subject: "", mark: "", remark: "" }))
  );

  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingMeta(true);
      setMetaError("");
      try {
        const [cls, sec, examRes, yearRes] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getExam({}, token),
          getAcademicYear(token),
        ]);
        const yearList = Array.isArray(yearRes?.data) ? yearRes.data : [];
        const activeYear =
          yearList.find((item) => String(item.isActive) === "1") ||
          yearList[0] ||
          null;
        setClasses(Array.isArray(cls) ? cls : []);
        setSections(Array.isArray(sec) ? sec : []);
        setExams(Array.isArray(examRes?.data) ? examRes.data : []);
        setAcademicYear(activeYear?.academicYear || activeYear?.name || "");
      } catch {
        setClasses([]);
        setSections([]);
        setExams([]);
        setAcademicYear("");
        setMetaError("No data available");
        toast.error("Failed to load form data");
      } finally {
        setLoadingMeta(false);
      }
    };
    loadDropdowns();
  }, [token]);

  useEffect(() => {
    if (!classId || !sectionId) {
      setStudents([]);
      setStudentId("");
      setStudentsError("");
      return;
    }
    const loadStudents = async () => {
      setLoadingStudents(true);
      setStudentsError("");
      try {
        const res = await getStudentlist(
          { userName: 0, classId: parseInt(classId, 10), sectionId: parseInt(sectionId, 10) },
          token
        );
        const list = Array.isArray(res?.data)
          ? res.data.map((s) => ({
              id: s.admissionNo,
              name: s.studentName,
            }))
          : [];
        setStudents(list);
        setStudentId("");
        if (!list.length) {
          setStudentsError("No data available");
        }
      } catch {
        toast.error("Failed to load students");
        setStudents([]);
        setStudentsError("No data available");
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [classId, sectionId, token]);

  useEffect(() => {
    if (!classId || !sectionId || !examId || !studentId) {
      setSubjects([]);
      setSubjectsError("");
      setRows(Array.from({ length: ROW_COUNT }, () => ({ subject: "", mark: "", remark: "" })));
      return;
    }

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError("");
      try {
        const subj = await getSubject(0, token);
        const list = Array.isArray(subj) ? subj : [];
        setSubjects(list);
        if (!list.length) {
          setSubjectsError("No data available");
        }
      } catch {
        setSubjects([]);
        setSubjectsError("No data available");
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [classId, sectionId, examId, studentId, token]);

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "mark") {
        next[index].remark = calculateRemark(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    try {
    e.preventDefault();
    const filled = rows.filter((r) => r.subject && r.mark !== "");
    if (!studentId || !examId || !classId || !sectionId) {
      toast.error("Please fill all dropdown fields.");
      return;
    }
    if (filled.length === 0) {
      toast.error("Please enter at least one subject mark.");
      return;
    }

    setSubmitting(true);
    const body = {
      examId: parseInt(examId, 10),
      studentId,
      classId: parseInt(classId, 10),
      sectionId: parseInt(sectionId, 10),
      subjectId: filled.map((r) => parseInt(r.subject, 10)),
      mark: filled.map((r) => parseInt(r.mark, 10)),
      remark: filled.map((r) => r.remark),
    };

    await runApi(() => createExamreport(body, token), {
      successMsg: "Subject marks saved successfully",
      onSuccess: () => {
        setRows(Array.from({ length: ROW_COUNT }, () => ({ subject: "", mark: "", remark: "" })));
        setStudentId("");
        setExamId("");
        setClassId("");
        setSectionId("");
        setSubjects([]);
      },
    });
    setSubmitting(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit marks");
      setSubmitting(false);
    }
  };

  const metaUnavailable = !classes.length || !sections.length || !exams.length;
  const subjectReady = Boolean(classId && sectionId && examId && studentId);

  return (
    <div className="sdl-wrap">
      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Exam Types", val: loadingMeta ? "…" : exams.length, icon: "bx bxs-notepad", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Students", val: loadingStudents ? "…" : students.length, icon: "bx bxs-user", color: "#16a34a", bg: "#dcfce7" },
          { label: "Subjects", val: loadingMeta ? "…" : subjects.length, icon: "bx bxs-book", color: "#E8541A", bg: "#fdf0eb" },
        ].map((s, i) => (
          <div className="sdl-stat-card" key={i}>
            <div className="sdl-stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={s.icon}></i>
            </div>
            <div>
              <div className="sdl-stat-val">{s.val}</div>
              <div className="sdl-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loadingMeta ? (
        <div className="exam-form-card" style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
          Loading form…
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="exam-form-card">
            <h3 className="exam-form-title">Subject Mark Entry</h3>

            <div className="exam-form-grid">
              <div className="exam-field">
                <label>Academic Year</label>
                <input type="text" value={academicYear || "No data available"} readOnly />
              </div>
              <div className="exam-field">
                <label>Class</label>
                <select value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Class {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="exam-field">
                <label>Section</label>
                <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>Section {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="exam-field">
                <label>Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={loadingStudents || !classId || !sectionId}
                >
                  <option value="">
                    {loadingStudents ? "Loading students…" : "Select Student"}
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="exam-field">
                <label>Exam</label>
                <select value={examId} onChange={(e) => setExamId(e.target.value)}>
                  <option value="">Select Exam</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.exam}</option>
                  ))}
                </select>
              </div>
            </div>

            {(metaError || metaUnavailable || studentsError || subjectsError) && (
              <div className="sdl-empty" style={{ marginTop: 16 }}>
                <i className="bx bx-info-circle"></i>
                <span>
                  {metaError ||
                    (metaUnavailable
                      ? "No data available"
                      : studentsError || subjectsError)}
                </span>
              </div>
            )}

            <div className="sdl-table-card exam-marks-table">
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Mark</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="sdl-num">{index + 1}</td>
                      <td>
                        <div className="exam-field">
                          <select
                            value={row.subject}
                            onChange={(e) => updateRow(index, "subject", e.target.value)}
                            disabled={!subjectReady || loadingSubjects || !subjects.length}
                          >
                            <option value="">
                              {!subjectReady
                                ? "Select class, section, student and exam first"
                                : loadingSubjects
                                  ? "Loading subjects..."
                                  : "Select Subject"}
                            </option>
                            {subjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="exam-field">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0–100"
                            value={row.mark}
                            onChange={(e) => updateRow(index, "mark", e.target.value)}
                            disabled={!subjectReady || loadingSubjects || !subjects.length}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="exam-field">
                          <input type="text" readOnly placeholder="Auto" value={row.remark} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="exam-form-actions">
              <button type="button" className="exam-btn-cancel" onClick={() => navigate(`${portalBase}/examresult`)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="exam-btn-submit" disabled={submitting || metaUnavailable || !subjectReady || !subjects.length}>
                {submitting ? (
                  <><i className="bx bx-loader-alt bx-spin"></i> Submitting…</>
                ) : (
                  "Submit Marks"
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
}
