import React, { useState, useEffect } from "react";
import { getToken, getUserData } from "../../services/auth";
import { getHomework, updateHomeworkProgress } from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

const STATUS_STYLE = {
  Pending:     { bg: "#fef3c7", color: "#d97706" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb" },
  Completed:   { bg: "#dcfce7", color: "#16a34a" },
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

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    runApi(() => getHomework({ classId, sectionId, subjectId: 0 }, token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setHomework(list);
        const init = {};
        list.forEach(hw => { init[hw.id] = hw.progressStatus || "Pending"; });
        setProgress(init);
      },
    }).finally(() => setLoading(false));
  }, [classId, sectionId]);

  const handleStatusChange = async (id, newStatus) => {
    setProgress(p => ({ ...p, [id]: newStatus }));
    setSaving(id);
    await runApi(() => updateHomeworkProgress({ id, status: newStatus }, token), {
      successMsg: "Progress updated!",
    });
    setSaving(null);
  };

  const filtered = filter === "All"
    ? homework
    : homework.filter(hw => (progress[hw.id] || "Pending") === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = homework.filter(hw => (progress[hw.id] || "Pending") === s).length;
    return acc;
  }, { All: homework.length });

  if (loading) return <div className="sm-loading"><i className="bx bx-loader-alt bx-spin"></i> Loading homework...</div>;

  return (
    <div className="sm-wrap">
      {/* Header */}
      <div className="sm-header">
        <div className="sm-header-left">
          <i className="bx bxs-book sm-header-icon" style={{ color: "#2563eb" }}></i>
          <div>
            <h2 className="sm-title">My Homework</h2>
            <p className="sm-subtitle">Track and update your homework progress</p>
          </div>
        </div>
        <div className="sm-stat-chips">
          {["All", ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              className={`sm-chip${filter === s ? " active" : ""}`}
              style={filter === s && STATUS_STYLE[s] ? { background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color, borderColor: STATUS_STYLE[s].color } : {}}
              onClick={() => setFilter(s)}
            >
              {s} <span className="sm-chip-count">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="sm-summary-row">
        {STATUS_OPTIONS.map(s => (
          <div className="sm-summary-card" key={s} style={{ borderTop: `3px solid ${STATUS_STYLE[s].color}` }}>
            <div className="sm-summary-val" style={{ color: STATUS_STYLE[s].color }}>{counts[s]}</div>
            <div className="sm-summary-label">{s}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="sm-empty">
          <i className="bx bx-book-open"></i>
          <p>No homework found{filter !== "All" ? ` for "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="sm-card-grid">
          {filtered.map((hw, i) => {
            const status = progress[hw.id] || "Pending";
            const style  = STATUS_STYLE[status];
            return (
              <div className="sm-hw-card" key={hw.id || i}>
                <div className="sm-hw-card-top">
                  <span className="sm-subject-pill">{hw.subject || hw.subjectName || "Subject"}</span>
                  <span className="sm-status-pill" style={{ background: style.bg, color: style.color }}>
                    {status}
                  </span>
                </div>
                <p className="sm-hw-desc">{hw.description || hw.title || "—"}</p>
                <div className="sm-hw-meta">
                  <span><i className="bx bx-calendar"></i> {hw.date || hw.dueDate || "—"}</span>
                  {hw.staffName && <span><i className="bx bx-user"></i> {hw.staffName}</span>}
                </div>
                <div className="sm-progress-row">
                  <label className="sm-progress-label">Update Progress:</label>
                  <div className="sm-progress-btns">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        className={`sm-prog-btn${status === s ? " selected" : ""}`}
                        style={status === s ? { background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color, borderColor: STATUS_STYLE[s].color } : {}}
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
