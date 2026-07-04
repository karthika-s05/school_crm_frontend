import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import {
  createExamreport,
  getExam,
  getClass,
  getSection,
  getSubject,
  getStudentlist,
} from "../../services/api";
import { getToken } from "../../services/auth";
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
  const token = getToken();
  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState(
    Array.from({ length: ROW_COUNT }, () => ({ subject: "", mark: "", remark: "" }))
  );

  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingMeta(true);
      try {
        const [cls, sec, examRes, subj] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getExam({}, token),
          getSubject(0, token),
        ]);
        setClasses(Array.isArray(cls) ? cls : []);
        setSections(Array.isArray(sec) ? sec : []);
        setExams(Array.isArray(examRes?.data) ? examRes.data : []);
        setSubjects(Array.isArray(subj) ? subj : []);
      } catch {
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
      return;
    }
    const loadStudents = async () => {
      setLoadingStudents(true);
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
      } catch {
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [classId, sectionId, token]);

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
      },
    });
    setSubmitting(false);
  };

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
                          >
                            <option value="">Select Subject</option>
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
              <button type="button" className="exam-btn-cancel" onClick={() => navigate("/examresult")} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="exam-btn-submit" disabled={submitting}>
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

      <ToastContainer position="top-right" autoClose={2000} style={{ fontSize: "14px" }} />
    </div>
  );
}
