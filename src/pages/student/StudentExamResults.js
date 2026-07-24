import React, { useEffect, useMemo, useState } from "react";
import { getStudentExamReport } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const flattenResults = (value) => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((group) => (Array.isArray(group) ? group : []));
};

const markPercent = (obtained, total) => {
  const o = Number(obtained);
  const t = Number(total);
  if (!Number.isFinite(o) || !Number.isFinite(t) || t <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((o / t) * 100)));
};

const barColor = (pct) => {
  if (pct == null) return "#cbd5e1";
  if (pct >= 75) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  if (pct >= 35) return "#f97316";
  return "#ef4444";
};

const StudentExamResults = () => {
  const token = getToken();
  const [rows, setRows] = useState([]);
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
        setRows(flattenResults(res?.data));
      },
      onError: () => {
        setRows([]);
        setError("Unable to load exam results.");
      },
    }).finally(() => setLoading(false));
  }, [token]);

  const summary = useMemo(() => {
    if (!rows.length) {
      return { total: 0, average: 0, passed: 0 };
    }
    const total = rows.length;
    const marks = rows.reduce(
      (sum, item) => sum + Number(item.obtainedMark ?? item.mark ?? 0),
      0
    );
    const passed = rows.filter(
      (item) => String(item.result || "").toLowerCase() === "pass"
    ).length;
    return {
      total,
      average: Math.round(marks / total),
      passed,
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading exam results...
      </div>
    );
  }

  return (
    <div className="sm-page">
      {/* Hero header */}
      {/* <div className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-icon"><i className="bx bxs-award"></i></div>
          <div>
            <h2 className="sm-hero-title">My Exam Results</h2>
            <p className="sm-hero-sub">Published results for your own record only</p>
          </div>
        </div>
        <div className="sm-hero-stats">
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{summary.total}</div>
            <div className="sm-hero-stat-label">Subjects</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{summary.passed}</div>
            <div className="sm-hero-stat-label">Passed</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{summary.average}</div>
            <div className="sm-hero-stat-label">Avg Mark</div>
          </div>
        </div>
      </div> */}

      {/* Content */}
      {error ? (
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="sm-empty">
          <i className="bx bx-file-blank"></i>
          <p className="sm-empty-title">No Exam Results Published</p>
          <p className="sm-empty-sub">Results will appear here after your teachers publish them.</p>
        </div>
      ) : (
        <div className="sm-table-card">
          <table className="sm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Result</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => {
                const obtained = item.obtainedMark ?? item.mark;
                const total = item.totalMark ?? item.totalMarks;
                const pct = markPercent(obtained, total);
                const result = String(item.result || "").toLowerCase();
                const resultCls =
                  result === "pass" ? "pass" : result === "fail" ? "fail" : "na";
                return (
                  <tr key={`${item.exam || item.examName || "exam"}-${item.subjectName || item.subject || index}`}>
                    <td className="sm-num">{index + 1}</td>
                    <td>{item.exam || item.examName || "Exam"}</td>
                    <td style={{ fontWeight: 600 }}>{item.subjectName || item.subject || "Subject"}</td>
                    <td>
                      <div className="sm-markbar-wrap">
                        <div className="sm-markbar">
                          <div
                            className="sm-markbar-fill"
                            style={{ width: `${pct ?? 0}%`, background: barColor(pct) }}
                          ></div>
                        </div>
                        <span className="sm-mark-text">
                          {obtained ?? "-"}/{total ?? "-"}
                        </span>
                      </div>
                    </td>
                    <td><span className="sm-grade-badge">{item.grade || "-"}</span></td>
                    <td>
                      <span className={`sm-result-pill ${resultCls}`}>
                        {item.result || "-"}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{item.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentExamResults;
