import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../services/services.css";
import { getClass, getReportsOverview, getSection } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const CARDS = [
  { title: "Assignment Report", path: "/assignment", icon: "bx bx-task", color: "#2D3A8C" },
  { title: "Exam Report", path: "/examtable", icon: "bx bx-book-open", color: "#E8541A" },
  { title: "Attendance Report", path: "/reports/attendance", icon: "bx bx-calendar-check", color: "#16a34a" },
  { title: "Homework Report", path: "/reports/homework", icon: "bx bx-notepad", color: "#8b5cf6" },
];

export default function ReportsOverview() {
  const token = getToken();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
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
        setError("Failed to load class and section filters.");
      }
    };
    loadMeta();
  }, [token]);

  const fetchOverview = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    setError(null);
    await runApi(
      () =>
        getReportsOverview(
          { classId: Number(classId), sectionId: Number(sectionId) },
          token
        ),
      {
        onSuccess: (res) => setOverview(res.data || null),
        onError: () => setError("Failed to load reports overview."),
      }
    );
    setLoading(false);
  }, [classId, sectionId, token]);

  useEffect(() => {
    if (classId && sectionId) fetchOverview();
  }, [fetchOverview, classId, sectionId]);

  return (
    <div className="sdl-wrap" style={{ padding: "24px 28px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Reports Overview</h2>
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Summary across assignments, homework, attendance, and exams.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select
          className="wz-input"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="wz-input"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="button" className="fw-btn-fill btn-gradient-add" onClick={fetchOverview}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fef2f2", color: "#ef4444", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading overview…</p>
      ) : overview ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div className="crm-stat-card">
            <div className="crm-stat-label">Assignments</div>
            <div className="crm-stat-value">{overview.assignment?.total ?? 0}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Active {overview.assignment?.active ?? 0} · Closed {overview.assignment?.closed ?? 0}
            </div>
          </div>
          <div className="crm-stat-card">
            <div className="crm-stat-label">Homework</div>
            <div className="crm-stat-value">{overview.homework?.total ?? 0}</div>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              textDecoration: "none",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${card.color}18`,
                color: card.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              <i className={card.icon} />
            </span>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>{card.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
