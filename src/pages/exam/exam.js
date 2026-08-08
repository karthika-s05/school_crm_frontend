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
  getexamPortion,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const ROW_COUNT = 6;

/** Grade + remark from gained marks vs total/pass marks. */
export const evaluateMark = (gained, totalMark, passMark) => {
  if (gained === "" || gained === null || gained === undefined) {
    return { grade: "", remark: "", result: "" };
  }
  const mark = Number(gained);
  const total = Number(totalMark) || 0;
  const pass = Number(passMark) || 0;
  if (!Number.isFinite(mark)) return { grade: "", remark: "", result: "" };

  if (mark < 0) return { grade: "Ab", remark: "Absent", result: "Absent" };
  if (total <= 0) return { grade: "", remark: "", result: "" };

  const pct = Math.round((mark / total) * 100);
  const failed = pass > 0 ? mark < pass : pct < 40;

  if (failed) return { grade: "F", remark: "Fail", result: "Fail" };
  if (pct >= 85) return { grade: "A+", remark: "Very Good", result: "Pass" };
  if (pct >= 75) return { grade: "A", remark: "Very Good", result: "Pass" };
  if (pct >= 60) return { grade: "B", remark: "Good", result: "Pass" };
  if (pct >= 50) return { grade: "C", remark: "Average", result: "Pass" };
  return { grade: "D", remark: "Average", result: "Pass" };
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
  const [portionSubjects, setPortionSubjects] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [subjectsError, setSubjectsError] = useState("");
  const [rows, setRows] = useState(
    Array.from({ length: ROW_COUNT }, () => ({
      subject: "",
      mark: "",
      totalMark: "",
      grade: "",
      remark: "",
      result: "",
    }))
  );

  const selectedExam = useMemo(
    () => exams.find((ex) => String(ex.id) === String(examId)) || null,
    [exams, examId]
  );

  const examTotalMark = Number(selectedExam?.totalMark || 0);
  const examPassMark = Number(selectedExam?.passMark || 0);

  const filteredExams = useMemo(() => {
    if (!classId || !sectionId) return exams;
    return exams.filter(
      (ex) =>
        String(ex.classId) === String(classId) &&
        String(ex.sectionId) === String(sectionId)
    );
  }, [exams, classId, sectionId]);

  const filteredSections = useMemo(() => {
    if (!classId) return sections;
    return sections.filter((s) => {
      const cid = s.classId ?? s.class_id;
      return cid == null || String(cid) === String(classId);
    });
  }, [sections, classId]);

  const subjectOptions = useMemo(() => {
    if (portionSubjects.length) {
      const ids = new Set(portionSubjects.map((p) => String(p.subjectId || p.id)));
      const fromMaster = subjects.filter((s) => ids.has(String(s.id)));
      if (fromMaster.length) return fromMaster;
      return portionSubjects.map((p) => ({
        id: p.subjectId || p.id,
        name: p.subjectName || p.subject || p.name,
        totalMarks: p.totalMarks,
      }));
    }
    return subjects;
  }, [portionSubjects, subjects]);

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
        if (!list.length) setStudentsError("No data available");
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
    setExamId("");
  }, [classId, sectionId]);

  useEffect(() => {
    if (!classId || !sectionId || !examId || !studentId) {
      setSubjects([]);
      setPortionSubjects([]);
      setSubjectsError("");
      setRows(
        Array.from({ length: ROW_COUNT }, () => ({
          subject: "",
          mark: "",
          totalMark: "",
          grade: "",
          remark: "",
          result: "",
        }))
      );
      return;
    }

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError("");
      try {
        const [subj, portionRes] = await Promise.all([
          getSubject(0, token),
          getexamPortion(
            {
              id: 0,
              classId: parseInt(classId, 10),
              sectionId: parseInt(sectionId, 10),
            },
            token
          ).catch(() => ({ data: [] })),
        ]);
        const list = Array.isArray(subj) ? subj : [];
        setSubjects(list);
        const portions = Array.isArray(portionRes?.data)
          ? portionRes.data.filter((p) => String(p.examId) === String(examId))
          : [];
        setPortionSubjects(portions);
        if (!list.length && !portions.length) setSubjectsError("No data available");
      } catch {
        setSubjects([]);
        setPortionSubjects([]);
        setSubjectsError("No data available");
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, [classId, sectionId, examId, studentId, token]);

  const resolveTotalForSubject = (subjectId) => {
    const portion = portionSubjects.find(
      (p) => String(p.subjectId || p.id) === String(subjectId)
    );
    if (portion?.totalMarks) return Number(portion.totalMarks);
    return examTotalMark || "";
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };

      if (field === "subject") {
        const total = resolveTotalForSubject(value);
        row.totalMark = total;
        const evaluated = evaluateMark(row.mark, total, examPassMark);
        row.grade = evaluated.grade;
        row.remark = evaluated.remark;
        row.result = evaluated.result;
      }

      if (field === "mark") {
        const total = row.totalMark || examTotalMark;
        const evaluated = evaluateMark(value, total, examPassMark);
        row.grade = evaluated.grade;
        row.remark = evaluated.remark;
        row.result = evaluated.result;
      }

      next[index] = row;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const filled = rows.filter((r) => r.subject && r.mark !== "");
      if (!studentId || !examId || !classId || !sectionId) {
        toast.error("Please fill Class, Section, Student and Exam.");
        return;
      }
      if (filled.length === 0) {
        toast.error("Please enter at least one subject mark.");
        return;
      }
      for (const row of filled) {
        const total = Number(row.totalMark || examTotalMark || 0);
        if (Number(row.mark) > total) {
          toast.error("Gained marks cannot exceed total marks.");
          return;
        }
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
        grade: filled.map((r) => r.grade),
      };

      await runApi(() => createExamreport(body, token), {
        successMsg: "Exam report submitted successfully",
        onSuccess: () => {
          setRows(
            Array.from({ length: ROW_COUNT }, () => ({
              subject: "",
              mark: "",
              totalMark: "",
              grade: "",
              remark: "",
              result: "",
            }))
          );
          setStudentId("");
          setExamId("");
          setClassId("");
          setSectionId("");
          setSubjects([]);
          setPortionSubjects([]);
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
          { label: "Exam Types", val: loadingMeta ? "…" : filteredExams.length, icon: "bx bxs-notepad", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Students", val: loadingStudents ? "…" : students.length, icon: "bx bxs-user", color: "#16a34a", bg: "#dcfce7" },
          { label: "Subjects", val: loadingSubjects ? "…" : subjectOptions.length, icon: "bx bxs-book", color: "#E8541A", bg: "#fdf0eb" },
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
            <h3 className="exam-form-title">Submit Exam Report</h3>

            <div className="exam-form-grid">
              <div className="exam-field">
                <label>Academic Year</label>
                <input type="text" value={academicYear || "No data available"} readOnly />
              </div>
              <div className="exam-field">
                <label>Class</label>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setSectionId("");
                  }}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Class {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="exam-field">
                <label>Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  disabled={!classId}
                >
                  <option value="">Select Section</option>
                  {filteredSections.map((s) => (
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
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  disabled={!classId || !sectionId}
                >
                  <option value="">Select Exam</option>
                  {filteredExams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.exam} (Total {ex.totalMark}, Pass {ex.passMark})
                    </option>
                  ))}
                </select>
              </div>
              {selectedExam && (
                <div className="exam-field">
                  <label>Exam Marks Config</label>
                  <input
                    type="text"
                    readOnly
                    value={`Total: ${examTotalMark} | Pass: ${examPassMark}`}
                  />
                </div>
              )}
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
                    <th>Subject</th>
                    <th>Total Marks</th>
                    <th>Gained Marks</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <div className="exam-field">
                          <select
                            value={row.subject}
                            onChange={(e) => updateRow(index, "subject", e.target.value)}
                            disabled={!subjectReady || loadingSubjects || !subjectOptions.length}
                          >
                            <option value="">
                              {!subjectReady
                                ? "Select class, student and exam first"
                                : loadingSubjects
                                  ? "Loading subjects..."
                                  : "Select Subject"}
                            </option>
                            {subjectOptions.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name || sub.subjectName || sub.subject}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="exam-field">
                          <input
                            type="number"
                            readOnly
                            placeholder="Auto"
                            value={row.totalMark}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="exam-field">
                          <input
                            type="number"
                            min="0"
                            max={row.totalMark || examTotalMark || undefined}
                            placeholder="Enter marks"
                            value={row.mark}
                            onChange={(e) => updateRow(index, "mark", e.target.value)}
                            disabled={!row.subject || !subjectReady}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="exam-field">
                          <input type="text" readOnly placeholder="Auto" value={row.grade} />
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
              <button
                type="button"
                className="exam-btn-cancel"
                onClick={() => navigate(`${portalBase}/examresult`)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="exam-btn-submit"
                disabled={submitting || metaUnavailable || !subjectReady || !subjectOptions.length}
              >
                {submitting ? (
                  <><i className="bx bx-loader-alt bx-spin"></i> Submitting…</>
                ) : (
                  "Submit Exam Report"
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
