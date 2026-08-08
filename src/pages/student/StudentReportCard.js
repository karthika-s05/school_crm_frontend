import React, { useEffect, useMemo, useState } from "react";
import {
  getStudentExamReport,
  getMyAttendanceSummaryV2,
  getStdAttendance,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";
import "./StudentReportCard.css";

const flattenResults = (value) => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group) => (Array.isArray(group) ? group : [group]));
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Mirrors the grade scale the exam service stores against each subject. */
const GRADE_SCALE = [
  { grade: "A+", range: "85% – 100%" },
  { grade: "A", range: "75% – 84%" },
  { grade: "B", range: "60% – 74%" },
  { grade: "C", range: "50% – 59%" },
  { grade: "D", range: "40% – 49%" },
  { grade: "F", range: "Below 40%" },
];

const calcGrade = (percentage) => {
  if (percentage >= 85) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

const ISSUE_DATE = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const examNameOf = (row) =>
  row?.exam || row?.examName || row?.examType || "Exam";

const StudentReportCard = () => {
  const token = getToken();
  const child = {
    name: getUserData("studentName") || getUserData("userName") || "Student",
    admissionNo: getUserData("admissionNo") || getUserData("userName") || "-",
    className: getUserData("className") || getUserData("classId") || "-",
    sectionName: getUserData("sectionName") || getUserData("sectionId") || "-",
    rollNo: getUserData("rollNo") || getUserData("rollNumber") || "-",
  };

  const [rows, setRows] = useState([]);
  const [attendance, setAttendance] = useState({
    workingDays: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExam, setSelectedExam] = useState("All");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    /** Accepts either the v2 monthly summary or the legacy summary shape. */
    const applyAttendance = (summary) => {
      const workingDays = toNumber(summary?.daysMarked ?? summary?.workingDays);
      const present = toNumber(summary?.presentEquivalent ?? summary?.present);
      const absent = Math.max(0, workingDays - present);
      const percentage =
        summary?.percentage != null
          ? Math.round(toNumber(summary.percentage))
          : workingDays
            ? Math.round((present / workingDays) * 100)
            : 0;
      setAttendance({ workingDays, present, absent, percentage });
    };

    const loadLegacyAttendance = (month) =>
      runApi(() => getStdAttendance({ month }, token), {
        onSuccess: (legacy) => {
          const row = Array.isArray(legacy?.data) ? legacy.data[0] : null;
          if (!row) return;
          applyAttendance({
            workingDays: row.WorkingDays ?? row.workingDays ?? row.totalWorkingDays,
            present: row.prestent ?? row.present ?? row.presented,
            percentage: row.percentage,
          });
        },
      });

    const month = new Date().getMonth() + 1;
    setLoading(true);
    setError("");

    Promise.all([
      runApi(() => getStudentExamReport(token), {
        onSuccess: (res) => setRows(flattenResults(res?.data)),
        onError: () => setRows([]),
      }),
      runApi(() => getMyAttendanceSummaryV2({ month }, token), {
        onSuccess: (res) => {
          // v2 shape: { summary, data: { monthly: { summary }, legacySummary } }
          const summary =
            res?.summary || res?.data?.monthly?.summary || null;
          const workingDays = toNumber(summary?.daysMarked ?? summary?.workingDays);
          if (workingDays > 0) {
            applyAttendance(summary);
            return;
          }

          const legacySummary = res?.data?.legacySummary || res?.legacySummary;
          if (legacySummary && toNumber(legacySummary.workingDays) > 0) {
            applyAttendance(legacySummary);
            return;
          }

          loadLegacyAttendance(month);
        },
        onError: () => loadLegacyAttendance(month),
      }),
    ])
      .catch(() => setError("Unable to load report card details."))
      .finally(() => setLoading(false));
  }, [token]);

  const examNames = useMemo(() => {
    const names = [...new Set(rows.map(examNameOf).filter(Boolean))];
    return ["All", ...names];
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (selectedExam === "All") return rows;
    return rows.filter((row) => examNameOf(row) === selectedExam);
  }, [rows, selectedExam]);

  const examGroups = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = examNameOf(row);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return [...map.entries()];
  }, [filteredRows]);

  const overall = useMemo(() => {
    if (!filteredRows.length) {
      return {
        obtained: 0,
        total: 0,
        percentage: 0,
        grade: "-",
        result: "-",
        remarks: [],
      };
    }
    const obtained = filteredRows.reduce(
      (sum, row) => sum + toNumber(row.obtainedMark ?? row.mark),
      0
    );
    const total = filteredRows.reduce(
      (sum, row) => sum + toNumber(row.totalMark ?? row.totalMarks ?? row.total),
      0
    );
    const percentage = total ? Math.round((obtained / total) * 100) : 0;
    const failed = filteredRows.some(
      (row) => String(row.result || "").toLowerCase() === "fail"
    );
    const remarks = [
      ...new Set(
        filteredRows
          .map((row) => String(row.remarks || "").trim())
          .filter((text) => text && text !== "-")
      ),
    ];
    return {
      obtained,
      total,
      percentage,
      grade: calcGrade(percentage),
      result: failed ? "Fail" : "Pass",
      remarks,
    };
  }, [filteredRows]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading report card...
      </div>
    );
  }

  return (
    <div className="sm-page src-page">
      <div className="src-toolbar no-print">
        <div className="src-toolbar-actions">
          <select
            className="src-select"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            {examNames.map((name) => (
              <option key={name} value={name}>
                {name === "All" ? "All Exams (History)" : name}
              </option>
            ))}
          </select>
          <button type="button" className="src-print-btn" onClick={handlePrint}>
            <i className="bx bx-printer"></i> Download / Print
          </button>
        </div>
      </div>

      {error ? (
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="src-sheet" id="report-card-print">
        <div className="src-watermark" aria-hidden="true">KST</div>

        <header className="src-letterhead">
          <div className="src-crest">KST</div>
          <div className="src-letterhead-text">
            <h1 className="src-school-name">KST School</h1>
            <p className="src-doc-title">Progress Report Card</p>
          </div>
          <div className="src-issue">
            <span>Date of Issue</span>
            <strong>{ISSUE_DATE}</strong>
          </div>
        </header>

        <table className="src-particulars">
          <tbody>
            <tr>
              <th>Name of Student</th>
              <td>{child.name}</td>
              <th>Admission No.</th>
              <td>{child.admissionNo}</td>
            </tr>
            <tr>
              <th>Class &amp; Section</th>
              <td>{child.className} – {child.sectionName}</td>
              <th>Roll No.</th>
              <td>{child.rollNo}</td>
            </tr>
            <tr>
              <th>Examination</th>
              <td>{selectedExam === "All" ? "All Examinations" : selectedExam}</td>
              <th>Result</th>
              <td className={`src-result-cell ${String(overall.result).toLowerCase()}`}>
                {overall.result}
              </td>
            </tr>
          </tbody>
        </table>

        {examGroups.length === 0 ? (
          <p className="src-muted src-no-marks">
            No published results yet. Marks appear here once the school publishes them.
          </p>
        ) : (
          examGroups.map(([examName, subjects]) => {
            const obtained = subjects.reduce(
              (sum, row) => sum + toNumber(row.obtainedMark ?? row.mark),
              0
            );
            const total = subjects.reduce(
              (sum, row) => sum + toNumber(row.totalMark ?? row.totalMarks ?? row.total),
              0
            );
            const pct = total ? Math.round((obtained / total) * 100) : 0;
            return (
              <section className="src-exam-block" key={examName}>
                <h2 className="src-block-title">{examName}</h2>
                <table className="src-marks">
                  <thead>
                    <tr>
                      <th className="src-col-subject">Subject</th>
                      <th>Max Marks</th>
                      <th>Marks Obtained</th>
                      <th>Grade</th>
                      <th>Result</th>
                      <th className="src-col-remark">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((item, index) => {
                      const obtainedMark = item.obtainedMark ?? item.mark;
                      const totalMark = item.totalMark ?? item.totalMarks ?? item.total;
                      const result = String(item.result || "").toLowerCase();
                      return (
                        <tr key={`${examName}-${item.subjectName || item.subject || index}`}>
                          <td className="src-subject">
                            {item.subjectName || item.subject || "Subject"}
                          </td>
                          <td className="src-center">{totalMark ?? "-"}</td>
                          <td className="src-center src-bold">{obtainedMark ?? "-"}</td>
                          <td className="src-center">
                            {item.grade ||
                              calcGrade(
                                totalMark
                                  ? Math.round(
                                      (toNumber(obtainedMark) / toNumber(totalMark)) * 100
                                    )
                                  : 0
                              )}
                          </td>
                          <td className={`src-center ${result === "fail" ? "fail" : "pass"}`}>
                            {item.result || "-"}
                          </td>
                          <td>{item.remarks || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="src-bold">Total</td>
                      <td className="src-center src-bold">{total || "-"}</td>
                      <td className="src-center src-bold">{obtained}</td>
                      <td className="src-center src-bold">{calcGrade(pct)}</td>
                      <td className="src-center src-bold">{pct}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            );
          })
        )}

        <div className="src-two-col">
          <section>
            <h2 className="src-block-title">Overall Performance</h2>
            <table className="src-mini">
              <tbody>
                <tr>
                  <th>Marks Secured</th>
                  <td>{overall.obtained} / {overall.total || "-"}</td>
                </tr>
                <tr>
                  <th>Percentage</th>
                  <td>{overall.percentage}%</td>
                </tr>
                <tr>
                  <th>Grade</th>
                  <td>{overall.grade}</td>
                </tr>
                <tr>
                  <th>Result</th>
                  <td className={String(overall.result).toLowerCase()}>{overall.result}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="src-block-title">Attendance</h2>
            <table className="src-mini">
              <tbody>
                <tr>
                  <th>Working Days</th>
                  <td>{attendance.workingDays}</td>
                </tr>
                <tr>
                  <th>Days Present</th>
                  <td>{attendance.present}</td>
                </tr>
                <tr>
                  <th>Days Absent</th>
                  <td>{attendance.absent}</td>
                </tr>
                <tr>
                  <th>Attendance</th>
                  <td>{attendance.percentage}%</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <section>
          <h2 className="src-block-title">Class Teacher's Remarks</h2>
          <div className="src-remark-box">
            {overall.remarks.length ? (
              overall.remarks.join("; ")
            ) : (
              <span className="src-muted">—</span>
            )}
          </div>
        </section>

        <section>
          <h2 className="src-block-title">Grading Scale</h2>
          <table className="src-scale">
            <tbody>
              <tr>
                {GRADE_SCALE.map((item) => (
                  <th key={item.grade}>{item.grade}</th>
                ))}
              </tr>
              <tr>
                {GRADE_SCALE.map((item) => (
                  <td key={item.grade}>{item.range}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        <div className="src-signatures">
          <div><span className="src-sign-line"></span>Class Teacher</div>
          <div><span className="src-sign-line"></span>Principal</div>
          <div><span className="src-sign-line"></span>Parent / Guardian</div>
        </div>

        <p className="src-footnote">
          This is a computer generated report card issued by KST School.
        </p>
      </div>
    </div>
  );
};

export default StudentReportCard;
