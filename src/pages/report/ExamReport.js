import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../List/StudentDummyList.css";
import "../services/services.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import ServiceModal from "../services/ServiceModal";
import {
  getExamReportData,
  getExam,
  getClass,
  getSection,
  exportExamReportCsv,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi, downloadCsv } from "../../utils/apiHelper";

const GRADES = ["All", "A+", "A", "B+", "B", "C", "F"];
const PER_PAGE = 10;
const AV_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
const initials = (n) =>
  (n || "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const gradeColor = (g) =>
  ({
    "A+": "#16a34a",
    A: "#22c55e",
    "B+": "#2D3A8C",
    B: "#3b82f6",
    C: "#d97706",
    F: "#ef4444",
  }[g] || "#374151");
const gradeBg = (g) =>
  ({
    "A+": "#f0fdf4",
    A: "#f0fdf4",
    "B+": "#eef0fb",
    B: "#eff6ff",
    C: "#fef3c7",
    F: "#fef2f2",
  }[g] || "#f1f5f9");

const TABS = ["Results Table", "Class Analysis", "Grade Distribution"];

const mapRow = (item, index) => ({
  id: item.id || index + 1,
  admNo: item.admissionNo || item.admNo || "-",
  student: item.studentName || item.student || "-",
  cls: item.className || item.cls || "-",
  section: item.sectionName || item.section || "-",
  subject: item.subjectName || item.subject || "-",
  totalMark: item.totalMark ?? 100,
  obtained: Number(item.obtainedMark ?? item.obtained ?? item.mark ?? 0),
  grade: item.grade || "-",
  result: item.result || "Pass",
  rank: item.rank ?? "-",
  remarks: item.remarks || "-",
});

export default function ExamReport() {
  const [tab, setTab] = useState(0);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subject, setSubject] = useState("All");
  const [grade, setGrade] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewAdm, setViewAdm] = useState(null);

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pass: 0, fail: 0, avgMark: 0 });
  const [classAnalysis, setClassAnalysis] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);

  const token = getToken();

  useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      try {
        const [examRes, classList, sectionList] = await Promise.all([
          getExam({}, token),
          getClass(0, token),
          getSection(0, token),
        ]);
        const examList = (examRes?.data || []).map((e) => ({
          id: e.id,
          name: e.exam || e.name || `Exam ${e.id}`,
        }));
        const classOpts = (classList || []).map((c) => ({ id: c.id, name: c.name }));
        const sectionOpts = (sectionList || []).map((s) => ({ id: s.id, name: s.name }));
        setExams(examList);
        setClasses(classOpts);
        setSections(sectionOpts);
        if (examList.length) setExamId(String(examList[0].id));
        if (classOpts.length) setClassId(String(classOpts[0].id));
        if (sectionOpts.length) setSectionId(String(sectionOpts[0].id));
      } catch (err) {
        console.error(err);
        setError("Failed to load exam, class or section options.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, [token]);

  const fetchReport = useCallback(async () => {
    if (!examId || !classId || !sectionId) return;
    setLoading(true);
    setError(null);
    await runApi(
      () =>
        getExamReportData(
          {
            examId: Number(examId),
            classId: Number(classId),
            sectionId: Number(sectionId),
            search: search || undefined,
            subject: subject !== "All" ? subject : undefined,
            grade: grade !== "All" ? grade : undefined,
          },
          token
        ),
      {
        onSuccess: (res) => {
          setRows((res.data || []).map(mapRow));
          setSummary(
            res.summary || { total: 0, pass: 0, fail: 0, avgMark: 0 }
          );
          setClassAnalysis(res.classAnalysis || []);
          setGradeDistribution(res.gradeDistribution || []);
        },
        onError: () => setError("Failed to load exam report."),
      }
    );
    setLoading(false);
  }, [examId, classId, sectionId, search, subject, grade, token]);

  useEffect(() => {
    if (!metaLoading && examId && classId && sectionId) {
      fetchReport();
    }
  }, [fetchReport, metaLoading, examId, classId, sectionId]);

  const subjects = useMemo(() => {
    const unique = [...new Set(rows.map((r) => r.subject).filter((s) => s && s !== "-"))];
    return ["All", ...unique.sort()];
  }, [rows]);

  const totalPgs = Math.ceil(rows.length / PER_PAGE);
  const paged = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const studentResults = viewAdm ? rows.filter((r) => r.admNo === viewAdm) : [];
  const studentName = studentResults[0]?.student || "";
  const studentAvg = studentResults.length
    ? Math.round(studentResults.reduce((s, r) => s + r.obtained, 0) / studentResults.length)
    : 0;

  const reset = () => {
    setSearch("");
    setSubject("All");
    setGrade("All");
    setPage(1);
  };

  const handleExport = async () => {
    if (!examId || !classId || !sectionId) return;
    setExporting(true);
    await runApi(
      () =>
        exportExamReportCsv(
          {
            examId: Number(examId),
            classId: Number(classId),
            sectionId: Number(sectionId),
          },
          token
        ),
      {
        successMsg: "Export ready",
        onSuccess: (res) => {
          const { csv, filename } = res.data || {};
          if (csv) downloadCsv(csv, filename || `exam_report_${examId}.csv`);
        },
      }
    );
    setExporting(false);
  };

  const renderLoading = () => (
    <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
      <i
        className="bx bx-loader-alt bx-spin"
        style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}
      ></i>
      Loading exam report…
    </div>
  );

  const renderError = () =>
    error ? (
      <div
        style={{
          padding: "16px 20px",
          marginBottom: 16,
          background: "#fef2f2",
          borderRadius: 10,
          color: "#ef4444",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <i className="bx bx-error-circle" style={{ fontSize: 20 }}></i>
        {error}
      </div>
    ) : null;

  return (
    <div className="sdl-wrap">
      {renderError()}

      {/* ── Stats ── */}
      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          {
            label: "Total Records",
            val: summary.total ?? rows.length,
            icon: "bx bxs-spreadsheet",
            color: "#2D3A8C",
            bg: "#eef0fb",
          },
          {
            label: "Pass",
            val: summary.pass ?? 0,
            icon: "bx bxs-check-circle",
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Fail",
            val: summary.fail ?? 0,
            icon: "bx bxs-x-circle",
            color: "#ef4444",
            bg: "#fef2f2",
          },
          {
            label: "Avg Score",
            val: `${summary.avgMark ?? 0}/100`,
            icon: "bx bxs-bar-chart-alt-2",
            color: "#d97706",
            bg: "#fef3c7",
          },
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

      {/* ── Exam selector + Tabs + Export ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="svc-tabs">
          {TABS.map((t, i) => (
            <button
              key={i}
              className={`svc-tab${tab === i ? " active" : ""}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="svc-select"
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setPage(1);
            }}
            disabled={metaLoading}
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="svc-btn-save"
            onClick={handleExport}
            disabled={exporting || loading || !examId}
            style={{ height: 40, padding: "0 16px", fontSize: 13 }}
          >
            <i className={`bx ${exporting ? "bx-loader-alt bx-spin" : "bx-download"}`}></i>{" "}
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>
      </div>

      {/* ════════ TAB 0 – Results Table ════════ */}
      {tab === 0 && (
        <>
          <div className="sdl-header">
            <div className="sdl-search" style={{ maxWidth: 300 }}>
              <i className="bx bx-search"></i>
              <input
                placeholder="Search student or admission no…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                className="svc-select"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setPage(1);
                }}
                disabled={metaLoading}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setPage(1);
                }}
                disabled={metaLoading}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setPage(1);
                }}
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Subjects" : s}
                  </option>
                ))}
              </select>
              <select
                className="svc-select"
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setPage(1);
                }}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? "All Grades" : g}
                  </option>
                ))}
              </select>
              {(search || subject !== "All" || grade !== "All") && (
                <button
                  className="svc-btn-cancel"
                  onClick={reset}
                  style={{ height: 40, padding: "0 14px", fontSize: 12 }}
                >
                  <i className="bx bx-x"></i> Clear
                </button>
              )}
            </div>
          </div>

          <div className="sdl-table-card">
            {loading || metaLoading ? (
              renderLoading()
            ) : (
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Total</th>
                    <th>Obtained</th>
                    <th>Grade</th>
                    <th>Rank</th>
                    <th>Result</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="sdl-empty">
                        <i className="bx bx-search-alt"></i>
                        <span>No results found</span>
                      </td>
                    </tr>
                  ) : (
                    paged.map((r, i) => (
                      <tr key={`${r.id}-${r.subject}-${i}`}>
                        <td className="sdl-num">{(page - 1) * PER_PAGE + i + 1}</td>
                        <td>
                          <div className="sdl-student-cell">
                            <div
                              className="sdl-avatar"
                              style={{ background: AV_COLORS[r.id % AV_COLORS.length] }}
                            >
                              {initials(r.student)}
                            </div>
                            <div>
                              <div className="sdl-name">{r.student}</div>
                              <div className="sdl-email">{r.admNo}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="sdl-class-badge">
                            Class {r.cls}-{r.section}
                          </span>
                        </td>
                        <td>
                          <span className="svc-cat-badge">{r.subject}</span>
                        </td>
                        <td className="sdl-mobile">{r.totalMark}</td>
                        <td>
                          <strong
                            style={{
                              color:
                                r.obtained >= 75
                                  ? "#16a34a"
                                  : r.obtained >= 50
                                  ? "#d97706"
                                  : "#ef4444",
                            }}
                          >
                            {r.obtained}
                          </strong>
                        </td>
                        <td>
                          <span
                            className="sdl-status"
                            style={{
                              background: gradeBg(r.grade),
                              color: gradeColor(r.grade),
                              borderRadius: 20,
                            }}
                          >
                            {r.grade}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: "#374151" }}>#{r.rank}</td>
                        <td>
                          <span className={`sdl-status ${r.result.toLowerCase()}`}>
                            {r.result}
                          </span>
                        </td>
                        <td className="sdl-mobile">{r.remarks}</td>
                        <td>
                          <TableActionMenu
                            onView={() => setViewAdm(r.admNo)}
                            viewLabel="View Report"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loading && totalPgs > 1 && (
            <div className="sdl-pagination">
              <span className="sdl-page-info">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, rows.length)} of{" "}
                {rows.length}
              </span>
              <div className="sdl-page-btns">
                <button
                  className="sdl-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <i className="bx bx-chevron-left"></i>
                </button>
                {Array.from({ length: totalPgs }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`sdl-page-btn${page === p ? " active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="sdl-page-btn"
                  disabled={page === totalPgs}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <i className="bx bx-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════ TAB 1 – Class Analysis ════════ */}
      {tab === 1 && (
        <div className="sdl-table-card">
          {loading || metaLoading ? (
            renderLoading()
          ) : (
            <table className="sdl-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total Records</th>
                  <th>Average Score</th>
                  <th>Pass Rate</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {classAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="sdl-empty">
                      <i className="bx bx-search-alt"></i>
                      <span>No class analysis data</span>
                    </td>
                  </tr>
                ) : (
                  classAnalysis.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <span className="sdl-class-badge">Class {c.cls}</span>
                      </td>
                      <td>
                        <strong>{c.count}</strong>
                      </td>
                      <td>
                        <strong
                          style={{
                            color:
                              c.avg >= 75 ? "#16a34a" : c.avg >= 50 ? "#d97706" : "#ef4444",
                          }}
                        >
                          {c.avg}/100
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 100,
                              height: 8,
                              background: "#e9ebf0",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 999,
                                background:
                                  c.passRate >= 80
                                    ? "#16a34a"
                                    : c.passRate >= 60
                                    ? "#d97706"
                                    : "#ef4444",
                                width: `${c.passRate}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color:
                                c.passRate >= 80
                                  ? "#16a34a"
                                  : c.passRate >= 60
                                  ? "#d97706"
                                  : "#ef4444",
                            }}
                          >
                            {c.passRate}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="sdl-status"
                          style={{
                            background:
                              c.avg >= 80 ? "#dcfce7" : c.avg >= 60 ? "#fef3c7" : "#fef2f2",
                            color:
                              c.avg >= 80 ? "#16a34a" : c.avg >= 60 ? "#d97706" : "#ef4444",
                          }}
                        >
                          {c.avg >= 80
                            ? "Excellent"
                            : c.avg >= 60
                            ? "Average"
                            : "Needs Improvement"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ════════ TAB 2 – Grade Distribution ════════ */}
      {tab === 2 && (
        <>
          {loading || metaLoading ? (
            <div className="sdl-table-card">{renderLoading()}</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 16,
              }}
            >
              {gradeDistribution.length === 0 ? (
                <div className="sdl-table-card" style={{ gridColumn: "1/-1" }}>
                  <div className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No grade distribution data</span>
                  </div>
                </div>
              ) : (
                gradeDistribution.map((g, i) => (
                  <div
                    className="sdl-stat-card"
                    key={i}
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 28, fontWeight: 800, color: gradeColor(g.grade) }}>
                        Grade {g.grade}
                      </span>
                      <div
                        className="sdl-stat-icon"
                        style={{
                          background: gradeBg(g.grade),
                          color: gradeColor(g.grade),
                          width: 42,
                          height: 42,
                          fontSize: 20,
                        }}
                      >
                        <i className="bx bxs-graduation"></i>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                        {g.count}{" "}
                        <span style={{ fontSize: 14, color: "#94a3b8" }}>students</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                        {g.pct}% of total
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        background: "#e9ebf0",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          background: gradeColor(g.grade),
                          width: `${g.pct}%`,
                          transition: "width .4s",
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <ServiceModal
        open={!!viewAdm}
        onClose={() => setViewAdm(null)}
        width={660}
        headerContent={
          viewAdm ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                className="sdl-avatar"
                style={{
                  background: AV_COLORS[0],
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {initials(studentName)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  }}
                >
                  {studentName}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{viewAdm}</div>
              </div>
            </div>
          ) : null
        }
        footer={
          <>
            <button type="button" className="svc-btn-cancel" onClick={() => setViewAdm(null)}>
              Close
            </button>
            <button type="button" className="svc-btn-save">
              <i className="bx bx-download"></i> Export PDF
            </button>
          </>
        }
      >
        {viewAdm && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  label: "Subjects",
                  val: studentResults.length,
                  color: "#2D3A8C",
                  bg: "#eef0fb",
                },
                {
                  label: "Avg Score",
                  val: `${studentAvg}/100`,
                  color: "#16a34a",
                  bg: "#dcfce7",
                },
                {
                  label: "Pass Rate",
                  val: studentResults.length
                    ? `${Math.round(
                        (studentResults.filter((r) => r.result === "Pass").length /
                          studentResults.length) *
                          100
                      )}%`
                    : "0%",
                  color: "#d97706",
                  bg: "#fef3c7",
                },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
              Subject-wise Performance
            </div>
            <div className="sdl-table-card" style={{ boxShadow: "none", border: "1px solid #e9ebf0" }}>
              <table className="sdl-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Total</th>
                    <th>Obtained</th>
                    <th>Score Bar</th>
                    <th>Grade</th>
                    <th>Result</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <span className="svc-cat-badge">{r.subject}</span>
                      </td>
                      <td>{r.totalMark}</td>
                      <td>
                        <strong
                          style={{
                            color:
                              r.obtained >= 75
                                ? "#16a34a"
                                : r.obtained >= 50
                                ? "#d97706"
                                : "#ef4444",
                          }}
                        >
                          {r.obtained}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            style={{
                              width: 80,
                              height: 6,
                              background: "#e9ebf0",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 999,
                                background:
                                  r.obtained >= 75
                                    ? "#16a34a"
                                    : r.obtained >= 50
                                    ? "#d97706"
                                    : "#ef4444",
                                width: `${r.obtained}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="sdl-status"
                          style={{
                            background: gradeBg(r.grade),
                            color: gradeColor(r.grade),
                            borderRadius: 20,
                          }}
                        >
                          {r.grade}
                        </span>
                      </td>
                      <td>
                        <span className={`sdl-status ${r.result.toLowerCase()}`}>{r.result}</span>
                      </td>
                      <td className="sdl-mobile">{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ServiceModal>
    </div>
  );
}
