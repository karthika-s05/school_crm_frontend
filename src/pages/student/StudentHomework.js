import React, { useState, useEffect } from "react";
import { getToken, getUserData } from "../../services/auth";
import { getHomework, updateHomeworkProgress } from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

const STATUS_STYLE = {
  Pending:       { bg: "#fef3c7", color: "#d97706", accent: "#f59e0b" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb", accent: "#3b82f6" },
  Completed:     { bg: "#dcfce7", color: "#16a34a", accent: "#22c55e" },
};

const dueInfo = (raw) => {
  if (!raw) return null;
  const due = new Date(raw);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays < 0) return { cls: "overdue", text: "Overdue" };
  if (diffDays === 0) return { cls: "due-today", text: "Due today" };
  return null;
};

const StudentHomework = () => {
  const token     = getToken();
  const classId   = Number(getUserData("classId")   || 0);
  const sectionId = Number(getUserData("sectionId") || 0);

  const [homework,  setHomework]  = useState([]);
  const [progress,  setProgress]  = useState({});   // { [id]: status }
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(null);  // id being saved
  const [filter,    setFilter]    = useState("All");
  const [error,     setError]     = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }
    setLoading(true);
    setError("");
    runApi(() => getHomework({ classId, sectionId, subjectId: 0 }, token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setHomework(list);
        const init = {};
        list.forEach(hw => { init[hw.id] = hw.progressStatus || "Pending"; });
        setProgress(init);
      },
      onError: () => {
        setHomework([]);
        setError("Unable to load homework.");
      },
    }).finally(() => setLoading(false));
  }, [classId, sectionId, token]);

  const handleStatusChange = async (id, newStatus) => {
    const previous = progress[id] || "Pending";
    if (previous === newStatus) return;
    setProgress((p) => ({ ...p, [id]: newStatus }));
    setHomework((list) =>
      list.map((hw) =>
        String(hw.id) === String(id) ? { ...hw, progressStatus: newStatus } : hw
      )
    );
    setSaving(id);
    const ok = await runApi(() => updateHomeworkProgress({ id, status: newStatus }, token), {
      successMsg: "Progress updated!",
    });
    if (!ok) {
      setProgress((p) => ({ ...p, [id]: previous }));
      setHomework((list) =>
        list.map((hw) =>
          String(hw.id) === String(id) ? { ...hw, progressStatus: previous } : hw
        )
      );
    }
    setSaving(null);
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = homework.filter(hw => (progress[hw.id] || "Pending") === s).length;
    return acc;
  }, { All: homework.length });

  const filtered = filter === "All"
    ? homework
    : homework.filter(hw => (progress[hw.id] || "Pending") === filter);

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading homework...
      </div>
    );
  }

  return (
    <div className="sm-page">
      {/* Hero header */}
      {/* <div className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-icon"><i className="bx bxs-book"></i></div>
          <div>
            <h2 className="sm-hero-title">My Homework</h2>
            <p className="sm-hero-sub">Track and update your homework progress</p>
          </div>
        </div>
        <div className="sm-hero-stats">
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts.All}</div>
            <div className="sm-hero-stat-label">Total</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts.Pending}</div>
            <div className="sm-hero-stat-label">Pending</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts.Completed}</div>
            <div className="sm-hero-stat-label">Done</div>
          </div>
        </div>
      </div> */}

      {/* Filter chips */}
      <div className="sm-toolbar">
        <div className="sm-chips">
          {["All", ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`sm-chip${filter === s ? " active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s} <span className="sm-chip-count">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sm-empty">
          <i className="bx bx-book-open"></i>
          <p className="sm-empty-title">
            {filter !== "All" ? `No "${filter}" homework` : "No Homework Assigned"}
          </p>
          <p className="sm-empty-sub">
            {filter !== "All"
              ? "Try a different filter to see other homework."
              : "New homework from your teachers will appear here."}
          </p>
        </div>
      ) : (
        <div className="sm-card-grid">
          {filtered.map((hw, i) => {
            const status = progress[hw.id] || "Pending";
            const style  = STATUS_STYLE[status];
            const due    = dueInfo(hw.dueDate || hw.date);
            return (
              <div className="sm-task-card" key={hw.id || i}>
                <div className="sm-task-accent" style={{ background: style.accent }}></div>
                <div className="sm-task-body">
                  <div className="sm-task-top">
                    <span className="sm-subject-pill">{hw.subject || hw.subjectName || "Subject"}</span>
                    <span className="sm-status-pill" style={{ background: style.bg, color: style.color }}>
                      {status}
                    </span>
                  </div>
                  <p className="sm-task-desc">{hw.description || hw.title || "-"}</p>
                  <div className="sm-task-meta">
                    <span className="sm-meta-chip">
                      <i className="bx bx-calendar"></i> {hw.date || hw.dueDate || "-"}
                    </span>
                    {hw.staffName && (
                      <span className="sm-meta-chip">
                        <i className="bx bx-user"></i> {hw.staffName}
                      </span>
                    )}
                    {due && status !== "Completed" && (
                      <span className={`sm-meta-chip ${due.cls}`}>
                        <i className="bx bx-time-five"></i> {due.text}
                      </span>
                    )}
                  </div>
                </div>
                <div className="sm-progress-row">
                  <label className="sm-progress-label">My Progress</label>
                  <div className="sm-segment">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        className={status === s ? "selected" : ""}
                        style={status === s ? { color: STATUS_STYLE[s].color } : {}}
                        onClick={() => handleStatusChange(hw.id, s)}
                        disabled={saving === hw.id}
                      >
                        {saving === hw.id && status === s
                          ? <i className="bx bx-loader-alt bx-spin"></i>
                          : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
