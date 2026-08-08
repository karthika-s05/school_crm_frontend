import React, { useState, useEffect, useCallback } from "react";
import "../List/StudentDummyList.css";
import "../services/services.css";
import ServiceModal from "../services/ServiceModal";
import { getAssignmentReportData, getClass, getSection, exportAssignmentReportCsv, getAssignmentReportStudentWise } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi, downloadCsv } from "../../utils/apiHelper";

const PER_PAGE = 8;
const AV_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
const initials = (n) =>
  (n || "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const statusColor = (s) =>
  ({ Active: "#16a34a", Closed: "#2D3A8C", Upcoming: "#d97706" }[s] || "#64748b");
const statusBg = (s) =>
  ({ Active: "#f0fdf4", Closed: "#eef0fb", Upcoming: "#fef3c7" }[s] || "#f1f5f9");
const gradeColor = (g) =>
  ({
    "A+": "#16a34a",
    A: "#22c55e",
    "B+": "#2D3A8C",
    B: "#3b82f6",
    C: "#d97706",
    "-": "#94a3b8",
  }[g] || "#374151");

const mapAssignment = (item, index) => {
  const totalStudents = Number(item.totalStudents || 0);
  const submitted = Number(item.submitted || 0);
  return {
    id: item.id || index + 1,
    title: item.title || "-",
    cls: item.className || item.cls || "-",
    section: item.sectionName || item.section || "-",
    subject: item.subjectName || item.subject || "-",
    teacher: item.staffName || item.teacher || "-",
    startDate: item.startDate || "-",
    dueDate: item.endDate || item.dueDate || "-",
    totalStudents,
    submitted,
    pending: Number(item.pending ?? Math.max(0, totalStudents - submitted)),
    status: item.status || "Active",
    description: item.description || "-",
    submissions: item.submissions || [],
  };
};

export default function AssignmentReport() {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [page, setPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    closed: 0,
    submissionRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [subsLoading, setSubsLoading] = useState(false);

  const token = getToken();

  useEffect(() => {
    const loadMeta = async () => {
      setMetaLoading(true);
      try {
        const [classList, sectionList] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
        ]);
        const classOpts = (classList || []).map((c) => ({ id: c.id, name: c.name }));
        const sectionOpts = (sectionList || []).map((s) => ({ id: s.id, name: s.name }));
        setClasses(classOpts);
        setSections(sectionOpts);
        if (classOpts.length) setClassId(String(classOpts[0].id));
        if (sectionOpts.length) setSectionId(String(sectionOpts[0].id));
      } catch (err) {
        console.error(err);
        setError("Failed to load class or section options.");
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, [token]);

  const fetchReport = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    setError(null);
    await runApi(
      () =>
        getAssignmentReportData(
          {
            classId: Number(classId),
            sectionId: Number(sectionId),
            search: search || undefined,
          },
          token
        ),
      {
        onSuccess: (res) => {
          setAssignments((res.data || []).map(mapAssignment));
          setSummary(
            res.summary || { total: 0, active: 0, closed: 0, submissionRate: 0 }
          );
        },
        onError: () => setError("Failed to load assignment report."),
      }
    );
    setLoading(false);
  }, [classId, sectionId, search, token]);

  useEffect(() => {
    if (!metaLoading && classId && sectionId) {
      fetchReport();
    }
  }, [fetchReport, metaLoading, classId, sectionId]);

  const totalPgs = Math.ceil(assignments.length / PER_PAGE) || 1;

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPgs) setPage(totalPgs);
  }, [page, totalPgs]);

  const safePage = Math.min(page, totalPgs);
  const paged = assignments.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const upcoming = assignments.filter((a) => a.status === "Upcoming").length;

  const reset = () => {
    setSearch("");
    setPage(1);
  };

  const handleExport = async () => {
    if (!classId || !sectionId) return;
    setExporting(true);
    await runApi(
      () =>
        exportAssignmentReportCsv(
          {
            classId: Number(classId),
            sectionId: Number(sectionId),
            search: search || undefined,
          },
          token
        ),
      {
        successMsg: "Export ready",
        onSuccess: (res) => {
          const { csv, filename } = res.data || {};
          if (csv) downloadCsv(csv, filename || "assignment_report.csv");
        },
      }
    );
    setExporting(false);
  };

  const openAssignmentDetail = async (item) => {
    setViewItem({ ...item, submissions: [] });
    setSubsLoading(true);
    await runApi(
      () =>
        getAssignmentReportStudentWise(
          {
            assignmentId: item.id,
            classId: Number(classId),
            sectionId: Number(sectionId),
          },
          token
        ),
      {
        onSuccess: (res) => {
          const submissions = (res.data || []).map((s) => ({
            student: s.studentName || s.student || s.name,
            admNo: s.admissionNo || s.admNo || s.studentId,
            submittedOn: s.submittedOn || s.submittedDate || s.date || "-",
            marks: s.marks ?? s.mark ?? "-",
            grade: s.grade || "-",
            status:
              s.status === "Submitted" || s.submitted === 1 || s.isSubmitted
                ? "Submitted"
                : "Pending",
          }));
          setViewItem((prev) => (prev ? { ...prev, submissions } : prev));
        },
      }
    );
    setSubsLoading(false);
  };

  const subs = viewItem?.submissions || [];

  const renderLoading = () => (
    <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
      <i
        className="bx bx-loader-alt bx-spin"
        style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}
      ></i>
      Loading assignments…
    </div>
  );

  return (
    <div className="sdl-wrap">
      {error && (
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
      )}

      {/* ── Stats ── */}
      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          {
            label: "Total Assignments",
            val: summary.total ?? assignments.length,
            icon: "bx bxs-book-alt",
            color: "#2D3A8C",
            bg: "#eef0fb",
          },
          {
            label: "Active",
            val: summary.active ?? 0,
            icon: "bx bxs-check-circle",
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Upcoming",
            val: upcoming,
            icon: "bx bxs-time-five",
            color: "#d97706",
            bg: "#fef3c7",
          },
          {
            label: "Submission Rate",
            val: `${summary.submissionRate ?? 0}%`,
            icon: "bx bxs-bar-chart-alt-2",
            color: "#7c3aed",
            bg: "#f5f3ff",
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

      {/* ── Toolbar ── */}
      <div className="sdl-header">
        <div className="sdl-search" style={{ maxWidth: 320 }}>
          <i className="bx bx-search"></i>
          <input
            placeholder="Search title, subject, teacher…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
          {search && (
            <button
              className="svc-btn-cancel"
              onClick={reset}
              style={{ height: 40, padding: "0 14px", fontSize: 12 }}
            >
              <i className="bx bx-x"></i> Clear
            </button>
          )}
          <button
            type="button"
            className="svc-btn-save"
            onClick={handleExport}
            disabled={exporting || !classId || !sectionId}
            style={{ height: 40, padding: "0 16px", fontSize: 12 }}
          >
            <i className={`bx ${exporting ? "bx-loader-alt bx-spin" : "bx-download"}`}></i>
            {exporting ? " Exporting…" : " Export CSV"}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="sdl-table-card">
        {loading || metaLoading ? (
          renderLoading()
        ) : (
          <table className="sdl-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Due Date</th>
                <th>Submitted</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No assignments found</span>
                  </td>
                </tr>
              ) : (
                paged.map((a, i) => (
                  <tr key={a.id}>
                    <td>
                      <div>
                        <div className="sdl-name">{a.title}</div>
                        <div className="sdl-email">
                          {a.startDate} → {a.dueDate}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sdl-class-badge">
                        Class {a.cls}-{a.section}
                      </span>
                    </td>
                    <td>
                      <span className="svc-cat-badge">{a.subject}</span>
                    </td>
                    <td className="sdl-mobile">{a.teacher}</td>
                    <td className="sdl-dob">{a.dueDate}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 60,
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
                              background: "#16a34a",
                              width: `${
                                a.totalStudents
                                  ? Math.round((a.submitted / a.totalStudents) * 100)
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>
                          {a.submitted}/{a.totalStudents}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: a.pending > 0 ? "#ef4444" : "#16a34a",
                        }}
                      >
                        {a.pending}
                      </span>
                    </td>
                    <td>
                      <span
                        className="sdl-status"
                        style={{ background: statusBg(a.status), color: statusColor(a.status) }}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPgs > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, assignments.length)} of{" "}
            {assignments.length}
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

      <ServiceModal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        className="svc-modal-lg"
        headerContent={
          viewItem ? (
            <span className="svc-modal-title">
              <i className="bx bxs-book-alt" style={{ color: "#2D3A8C", flexShrink: 0 }}></i>
              {viewItem.title}
            </span>
          ) : null
        }
        footer={
          <>
            <button type="button" className="svc-btn-cancel" onClick={() => setViewItem(null)}>
              Close
            </button>
            <button type="button" className="svc-btn-save" onClick={handleExport} disabled={exporting}>
              <i className={`bx ${exporting ? "bx-loader-alt bx-spin" : "bx-download"}`}></i>
              {exporting ? " Exporting…" : " Export"}
            </button>
          </>
        }
      >
        {viewItem && (
          <>
            <div className="svc-view-grid" style={{ marginBottom: 20 }}>
              {[
                ["Class", `Class ${viewItem.cls}-${viewItem.section}`],
                ["Subject", viewItem.subject],
                ["Teacher", viewItem.teacher],
                ["Status", viewItem.status],
                ["Start Date", viewItem.startDate],
                ["Due Date", viewItem.dueDate],
                ["Total Students", viewItem.totalStudents],
                ["Submitted", viewItem.submitted],
                ["Pending", viewItem.pending],
              ].map(([k, v]) => (
                <div className="svc-view-row" key={k}>
                  <span className="svc-view-key">{k}</span>
                  <span className="svc-view-val">
                    {k === "Status" ? (
                      <span style={{ color: statusColor(v), fontWeight: 700 }}>{v}</span>
                    ) : (
                      v
                    )}
                  </span>
                </div>
              ))}
              <div className="svc-view-row" style={{ gridColumn: "1/-1" }}>
                <span className="svc-view-key">Description</span>
                <span
                  className="svc-view-val"
                  style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}
                >
                  {viewItem.description}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                  Submission Progress
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                  {viewItem.totalStudents
                    ? Math.round((viewItem.submitted / viewItem.totalStudents) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div style={{ height: 8, background: "#e9ebf0", borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg,#2D3A8C,#3b82f6)",
                    borderRadius: 999,
                    width: `${
                      viewItem.totalStudents
                        ? Math.round((viewItem.submitted / viewItem.totalStudents) * 100)
                        : 0
                    }%`,
                    transition: "width .4s",
                  }}
                ></div>
              </div>
            </div>

            {subsLoading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: "block", marginBottom: 8 }}></i>
                Loading submissions…
              </div>
            ) : subs.length > 0 ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
                  Student Submissions
                </div>
                <div
                  className="sdl-table-card"
                  style={{ boxShadow: "none", border: "1px solid #e9ebf0" }}
                >
                  <table className="sdl-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Adm. No</th>
                        <th>Submitted On</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s, i) => (
                        <tr key={i}>
                          <td>
                            <div className="sdl-student-cell">
                              <div
                                className="sdl-avatar"
                                style={{ background: AV_COLORS[i % AV_COLORS.length] }}
                              >
                                {initials(s.student || s.studentName)}
                              </div>
                              <div className="sdl-name">{s.student || s.studentName}</div>
                            </div>
                          </td>
                          <td className="sdl-adm">{s.admNo || s.admissionNo}</td>
                          <td className="sdl-dob">{s.submittedOn || "-"}</td>
                          <td>
                            <strong>{s.marks || "-"}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: gradeColor(s.grade) }}>
                              {s.grade}
                            </span>
                          </td>
                          <td>
                            <span className={`sdl-status ${(s.status || "").toLowerCase()}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                No submission records found for this assignment.
              </div>
            )}
          </>
        )}
      </ServiceModal>
    </div>
  );
}
