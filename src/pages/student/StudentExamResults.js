import React, { useEffect, useMemo, useState } from "react";
import { getStudentExamReport } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const GRADE_SCALE = [
  { grade: "A+", min: 85 },
  { grade: "A", min: 75 },
  { grade: "B", min: 60 },
  { grade: "C", min: 50 },
  { grade: "D", min: 40 },
  { grade: "F", min: 0 },
];

const calcGrade = (percentage) => {
  if (percentage == null) return "-";
  return (GRADE_SCALE.find((item) => percentage >= item.min) || { grade: "F" }).grade;
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const isAbsent = (row) =>
  String(row?.mark ?? "").trim().toUpperCase() === "A" ||
  Number(row?.mark) === -1;

const percentOf = (obtained, total) => {
  if (obtained == null || !total) return null;
  return Math.max(0, Math.min(100, (obtained / total) * 100));
};

const round = (value) => (value == null ? null : Math.round(value * 10) / 10);

const toneOf = (pct) => {
  if (pct == null) return "none";
  if (pct >= 75) return "high";
  if (pct >= 50) return "mid";
  if (pct >= 35) return "low";
  return "poor";
};

const gradeTone = (grade) => {
  const letter = String(grade || "").trim().charAt(0).toUpperCase();
  if (letter === "A") return "high";
  if (letter === "B") return "mid";
  if (letter === "C" || letter === "D") return "low";
  if (letter === "F") return "poor";
  return "none";
};

/** The API returns one array per exam; older payloads send a flat list. */
const toExamGroups = (data) => {
  if (!Array.isArray(data)) return [];

  const nested = data.filter((group) => Array.isArray(group) && group.length);
  if (nested.length) return nested;

  const flat = data.filter((row) => row && typeof row === "object");
  if (!flat.length) return [];

  const grouped = new Map();
  flat.forEach((row) => {
    const key = row.exam || row.examName || "Exam";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });
  return [...grouped.values()];
};

const buildExam = (rows, index) => {
  const first = rows[0] || {};
  const subjects = rows.map((row, subIndex) => {
    const absent = isAbsent(row);
    const obtained = absent ? null : toNumber(row.obtainedMark ?? row.mark);
    const total = toNumber(row.totalMark ?? row.total ?? row.totalMarks);
    const pct = absent ? null : percentOf(obtained, total);
    return {
      key: `${row.subjectName || row.subject || "subject"}-${subIndex}`,
      name: row.subjectName || row.subject || "Subject",
      absent,
      obtained,
      total,
      pct,
      grade: absent ? "-" : row.grade || calcGrade(pct),
      result: String(row.result || "").trim(),
      remarks: row.remarks || "",
    };
  });

  const attempted = subjects.filter((subject) => !subject.absent);
  const obtainedTotal = attempted.reduce(
    (sum, subject) => sum + (subject.obtained || 0),
    0
  );
  const maxTotal = subjects.reduce((sum, subject) => sum + (subject.total || 0), 0);
  const percentage = percentOf(obtainedTotal, maxTotal);
  const failed = subjects.filter(
    (subject) => subject.absent || subject.result.toLowerCase() === "fail"
  ).length;
  const passed = subjects.length - failed;
  const best = attempted.reduce(
    (top, subject) => (top && top.pct >= (subject.pct ?? -1) ? top : subject),
    null
  );

  return {
    id: `${first.examId || first.exam || "exam"}-${index}`,
    name: first.exam || first.examName || `Exam ${index + 1}`,
    className: first.className || first.class || "",
    section: first.sectionName || first.section || "",
    subjects,
    obtainedTotal,
    maxTotal,
    percentage,
    grade: calcGrade(percentage),
    passed,
    failed,
    best,
    result: failed > 0 ? "Fail" : subjects.length ? "Pass" : "-",
  };
};

const ScoreRing = ({ percentage }) => {
  const value = percentage == null ? 0 : Math.round(percentage);
  return (
    <div
      className="sm-res-ring"
      style={{ "--ring-value": `${value * 3.6}deg` }}
      role="img"
      aria-label={`Overall score ${value} percent`}
    >
      <div className="sm-res-ring-inner">
        <span className="sm-res-ring-value">
          {percentage == null ? "-" : value}
          <small>%</small>
        </span>
        <span className="sm-res-ring-label">Overall</span>
      </div>
    </div>
  );
};

const StudentExamResults = () => {
  const token = getToken();
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    runApi(() => getStudentExamReport(token), {
      onSuccess: (res) => {
        setExams(toExamGroups(res?.data).map(buildExam));
      },
      onError: () => {
        setExams([]);
        setError("Unable to load exam results.");
      },
    }).finally(() => setLoading(false));
  }, [token]);

  const overview = useMemo(() => {
    const subjects = exams.flatMap((exam) => exam.subjects);
    const obtained = exams.reduce((sum, exam) => sum + exam.obtainedTotal, 0);
    const max = exams.reduce((sum, exam) => sum + exam.maxTotal, 0);
    const passed = exams.reduce((sum, exam) => sum + exam.passed, 0);
    const best = exams.reduce(
      (top, exam) =>
        top && (top.percentage ?? -1) >= (exam.percentage ?? -1) ? top : exam,
      null
    );
    return {
      percentage: percentOf(obtained, max),
      subjects: subjects.length,
      passed,
      best,
      classLabel: [exams[0]?.className, exams[0]?.section]
        .filter(Boolean)
        .join(" · "),
    };
  }, [exams]);

  const visibleExams = useMemo(
    () =>
      activeExam === "all"
        ? exams
        : exams.filter((exam) => exam.id === activeExam),
    [exams, activeExam]
  );

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading exam results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="sm-page">
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!exams.length) {
    return (
      <div className="sm-page">
        <div className="sm-empty">
          <i className="bx bx-file-blank"></i>
          <p className="sm-empty-title">No Exam Results Published</p>
          <p className="sm-empty-sub">
            Results will appear here after your teachers publish them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm-page">
      <section className="sm-res-overview">
        <div className="sm-res-overview-main">
          <ScoreRing percentage={overview.percentage} />
          <div className="sm-res-overview-copy">
            <h2>Your Performance</h2>
            <p>
              {overview.classLabel
                ? `${overview.classLabel} · `
                : ""}
              {exams.length} published {exams.length === 1 ? "exam" : "exams"}
            </p>
            <span className={`sm-res-grade-chip ${gradeTone(calcGrade(overview.percentage))}`}>
              Grade {calcGrade(overview.percentage)}
            </span>
          </div>
        </div>

        <div className="sm-res-stats">
          <div className="sm-res-stat">
            <span className="sm-res-stat-val">{overview.subjects}</span>
            <span className="sm-res-stat-label">Subjects</span>
          </div>
          <div className="sm-res-stat">
            <span className="sm-res-stat-val">{overview.passed}</span>
            <span className="sm-res-stat-label">Passed</span>
          </div>
          <div className="sm-res-stat">
            <span className="sm-res-stat-val">
              {overview.best?.percentage == null
                ? "-"
                : `${round(overview.best.percentage)}%`}
            </span>
            <span className="sm-res-stat-label">Best Exam</span>
          </div>
        </div>
      </section>

      {exams.length > 1 && (
        <div className="sm-res-filter">
          <button
            type="button"
            className={`sm-chip${activeExam === "all" ? " active" : ""}`}
            onClick={() => setActiveExam("all")}
          >
            All Exams
            <span className="sm-chip-count">{exams.length}</span>
          </button>
          {exams.map((exam) => (
            <button
              key={exam.id}
              type="button"
              className={`sm-chip${activeExam === exam.id ? " active" : ""}`}
              onClick={() => setActiveExam(exam.id)}
            >
              {exam.name}
            </button>
          ))}
        </div>
      )}

      {visibleExams.map((exam) => (
        <section className="sm-res-card" key={exam.id}>
          <header className="sm-res-card-head">
            <div className="sm-res-card-title">
              <div className="sm-res-card-icon">
                <i className="bx bxs-award"></i>
              </div>
              <div>
                <h3>{exam.name}</h3>
                <p>
                  {[exam.className, exam.section].filter(Boolean).join(" · ") ||
                    "Your class"}
                  {" · "}
                  {exam.subjects.length}{" "}
                  {exam.subjects.length === 1 ? "subject" : "subjects"}
                </p>
              </div>
            </div>

            <div className="sm-res-card-metrics">
              <div className="sm-res-metric">
                <span className="sm-res-metric-val">
                  {exam.obtainedTotal}
                  <small>/{exam.maxTotal || "-"}</small>
                </span>
                <span className="sm-res-metric-label">Total Marks</span>
              </div>
              <div className="sm-res-metric">
                <span className={`sm-res-metric-val tone-${toneOf(exam.percentage)}`}>
                  {exam.percentage == null ? "-" : `${round(exam.percentage)}%`}
                </span>
                <span className="sm-res-metric-label">Percentage</span>
              </div>
              <div className="sm-res-metric">
                <span className={`sm-grade-badge ${gradeTone(exam.grade)}`}>
                  {exam.grade}
                </span>
                <span className="sm-res-metric-label">Grade</span>
              </div>
              <span
                className={`sm-result-pill ${
                  exam.result.toLowerCase() === "pass"
                    ? "pass"
                    : exam.result.toLowerCase() === "fail"
                    ? "fail"
                    : "na"
                }`}
              >
                {exam.result}
              </span>
            </div>
          </header>

          <div className="sm-res-table-wrap">
            <table className="sm-table sm-res-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Result</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {exam.subjects.map((subject, index) => {
                  const result = subject.result.toLowerCase();
                  return (
                    <tr key={subject.key}>
                      <td>
                        <span className="sm-res-subject">
                          <i className={`sm-res-dot ${toneOf(subject.pct)}`}></i>
                          {subject.name}
                        </span>
                      </td>
                      <td className="sm-res-marks">
                        {subject.absent ? (
                          <span className="sm-res-absent">Absent</span>
                        ) : (
                          <>
                            <strong>{subject.obtained ?? "-"}</strong>
                            <span> / {subject.total ?? "-"}</span>
                          </>
                        )}
                      </td>
                      <td>
                        <div className="sm-markbar-wrap">
                          <div className="sm-markbar">
                            <div
                              className={`sm-markbar-fill tone-${toneOf(subject.pct)}`}
                              style={{ width: `${subject.pct ?? 0}%` }}
                            ></div>
                          </div>
                          <span className="sm-mark-text">
                            {subject.pct == null ? "-" : `${Math.round(subject.pct)}%`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`sm-grade-badge ${gradeTone(subject.grade)}`}>
                          {subject.grade || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`sm-result-pill ${
                            result === "pass" ? "pass" : result === "fail" ? "fail" : "na"
                          }`}
                        >
                          {subject.result || "-"}
                        </span>
                      </td>
                      <td className="sm-res-remarks">{subject.remarks || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="sm-res-marks">
                    <strong>{exam.obtainedTotal}</strong>
                    <span> / {exam.maxTotal || "-"}</span>
                  </td>
                  <td>
                    {exam.percentage == null ? "-" : `${round(exam.percentage)}%`}
                  </td>
                  <td>
                    <span className={`sm-grade-badge ${gradeTone(exam.grade)}`}>
                      {exam.grade}
                    </span>
                  </td>
                  <td colSpan={2}>
                    {exam.failed > 0
                      ? `${exam.passed} passed · ${exam.failed} to improve`
                      : "All subjects passed"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
};

export default StudentExamResults;
