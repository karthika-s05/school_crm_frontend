import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../component/modules.css";
import { getClass, getReportsOverview, getSection } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const REPORT_CARDS = [
  { title: "Assignment Report", sub: "Track assignment submissions", path: "/assignment", icon: "bx bx-task",           color: "#2D3A8C", bg: "#eef0fb" },
  { title: "Exam Report",       sub: "View exam results & marks",   path: "/examtable",  icon: "bx bx-book-open",      color: "#E8541A", bg: "#fdf0eb" },
  { title: "Attendance Report", sub: "Daily & monthly attendance",  path: "/reports/attendance", icon: "bx bx-calendar-check", color: "#16a34a", bg: "#dcfce7" },
  { title: "Homework Report",   sub: "Homework completion status",  path: "/reports/homework",   icon: "bx bx-notepad",        color: "#7c3aed", bg: "#f5f3ff" },
];

export default function ReportsOverview() {
  const token = getToken();
  const [classes,   setClasses]   = useState([]);
  const [sections,  setSections]  = useState([]);
  const [classId,   setClassId]   = useState("");
  const [sectionId, setSectionId] = useState("");
  const [overview,  setOverview]  = useState(null);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec] = await Promise.all([getClass(0, token), getSection(0, token)]);
        const classOpts   = (cls  || []).map(c => ({ id: c.id, name: c.name }));
        const sectionOpts = (sec  || []).map(s => ({ id: s.id, name: s.name }));
        setClasses(classOpts);
        setSections(sectionOpts);
        if (classOpts[0])   setClassId(String(classOpts[0].id));
        if (sectionOpts[0]) setSectionId(String(sectionOpts[0].id));
      } catch {}
    };
    loadMeta();
  }, [token]);

  const fetchOverview = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    await runApi(
      () => getReportsOverview({ classId: Number(classId), sectionId: Number(sectionId) }, token),
      { onSuccess: (res) => setOverview(res.data || null) }
    );
    setLoading(false);
  }, [classId, sectionId, token]);

  useEffect(() => { if (classId && sectionId) fetchOverview(); }, [fetchOverview, classId, sectionId]);

  const statCards = [
    { label: "Total Assignments", value: overview?.assignment?.total ?? "—",  sub: `Active: ${overview?.assignment?.active ?? 0}`,  icon: "bx bx-task",           color: "#2D3A8C", bg: "#eef0fb" },
    { label: "Total Homework",    value: overview?.homework?.total    ?? "—",  sub: "Assigned tasks",                                icon: "bx bx-book",           color: "#d97706", bg: "#fef3c7" },
    { label: "Attendance Rate",   value: overview?.attendance?.rate   ?? "—",  sub: "This month",                                    icon: "bx bx-calendar-check", color: "#16a34a", bg: "#dcfce7" },
    { label: "Upcoming Exams",    value: overview?.exams?.upcoming    ?? "—",  sub: "Scheduled",                                     icon: "bx bx-edit",           color: "#E8541A", bg: "#fdf0eb" },
  ];

  return (
    <div className="mod-wrap">
      {/* Header */}
      <div className="mod-header">
        <div>
          {/* <h2 className="mod-title">Reports Overview</h2>
          <p className="mod-sub">Summary across assignments, homework, attendance and exams</p> */}
        </div>
        <div className="mod-pills">
          <span className="mod-pill blue"><i className="bx bx-bar-chart-alt-2"></i> Analytics</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mod-filter-card">
        <div className="mod-filter-group">
          <label>Class</label>
          <select className="mod-input" value={classId} onChange={e => setClassId(e.target.value)}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mod-filter-group">
          <label>Section</label>
          <select className="mod-input" value={sectionId} onChange={e => setSectionId(e.target.value)}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button className="mod-btn mod-btn-primary" onClick={fetchOverview}>
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="mod-loading"><div className="mod-spinner"></div> Loading overview...</div>
      ) : (
        <div className="mod-stat-row">
          {statCards.map((c, i) => (
            <div className="mod-stat-card" key={i}>
              <div className="mod-stat-icon" style={{ background: c.bg, color: c.color }}>
                <i className={c.icon}></i>
              </div>
              <div className="mod-stat-body">
                <div className="mod-stat-val">{c.value}</div>
                <div className="mod-stat-label">{c.label}</div>
                <div className="mod-stat-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Navigation Cards */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14 }}>
          <i className="bx bx-grid-alt" style={{ color: "#2D3A8C", marginRight: 8 }}></i>
          Report Modules
        </h3>
        <div className="mod-report-grid">
          {REPORT_CARDS.map(card => (
            <Link key={card.path} to={card.path} className="mod-report-card">
              <div className="mod-report-card-icon" style={{ background: card.bg, color: card.color }}>
                <i className={card.icon}></i>
              </div>
              <div className="mod-report-card-body">
                <span className="mod-report-card-title">{card.title}</span>
                <span className="mod-report-card-sub">{card.sub}</span>
              </div>
              <i className="bx bx-chevron-right" style={{ color: "#9ca3af", fontSize: 20 }}></i>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
