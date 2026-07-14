import React, { useState, useEffect } from "react";
import { getToken } from "../../services/auth";
import { getStudentAssignment, updateAssignmentProgress } from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Submitted"];

const STATUS_STYLE = {
  "Not Started": { bg: "#f1f5f9", color: "#64748b" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb" },
  Submitted:     { bg: "#dcfce7", color: "#16a34a" },
};

const StudentAssignment = () => {
  const token = getToken();

  const [assignments, setAssignments] = useState([]);
  const [progress,    setProgress]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [expanded,    setExpanded]    = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    runApi(() => getStudentAssignment(token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setAssignments(list);
        const init = {};
        list.forEach(a => { init[a.id] = a.progressStatus || "Not Started"; });
        setProgress(init);
      },
    }).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setProgress(p => ({ ...p, [id]: newStatus }));
    setSaving(id);
    await runApi(() => updateAssignmentProgress({ id, status: newStatus }, token), {
      successMsg: "Progress updated!",
    });
    setSaving(null);
  };

  const counts = { All: assignments.length };
  STATUS_OPTIONS.forEach(s => {
    counts[s] = assignments.filter(a => (progress[a.id] || "Not Started") === s).length;
  });

  const filtered = filter === "All"
    ? assignments
    : assignments.filter(a => (progress[a.id] || "Not Started") === filter);

  const isOpen = (a) => a.status === 1 || a.status === "open" || a.isOpen;

  if (loading) return <div className="sm-loading"><i className="bx bx-loader-alt bx-spin"></i> Loading assignments...</div>;

  return (
    <div className="sm-wrap">
      <div className="sm-header">
        <div className="sm-header-left">
          <i className="bx bxs-notepad sm-header-icon" style={{ color: "#7c3aed" }}></i>
          <div>
            <h2 className="sm-title">My Assignments</h2>
            <p className="sm-subtitle">View assigned tasks and update your submission progress</p>
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

      <div className="sm-summary-row">
        {STATUS_OPTIONS.map(s => (
          <div className="sm-summary-card" key={s} style={{ borderTop: `3px solid ${STATUS_STYLE[s].color}` }}>
            <div className="sm-summary-val" style={{ color: STATUS_STYLE[s].color }}>{counts[s]}</div>
            <div className="sm-summary-label">{s}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="sm-empty">
          <i className="bx bx-notepad"></i>
          <p>No assignments found{filter !== "All" ? ` for "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="sm-list">
          {filtered.map((a, i) => {
            const status  = progress[a.id] || "Not Started";
            const style   = STATUS_STYLE[status];
            const open    = isOpen(a);
            const isExpanded = expanded === (a.id || i);
            return (
              <div className="sm-assignment-row" key={a.id || i}>
                <div className="sm-asgn-main" onClick={() => setExpanded(isExpanded ? null : (a.id || i))}>
                  <div className="sm-asgn-left">
                    <div className="sm-asgn-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                      <i className="bx bxs-notepad"></i>
                    </div>
                    <div>
                      <div className="sm-asgn-title">{a.title}</div>
                      <div className="sm-asgn-meta">
                        <span className="sm-subject-pill">{a.subjectName || a.subject || "Subject"}</span>
                        <span className="sm-date-text"><i className="bx bx-calendar"></i> {a.startDate} – {a.endDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sm-asgn-right">
                    <span className={`sm-open-pill ${open ? "open" : "closed"}`}>{open ? "Open" : "Closed"}</span>
                    <span className="sm-status-pill" style={{ background: style.bg, color: style.color }}>{status}</span>
                    <i className={`bx bx-chevron-${isExpanded ? "up" : "down"} sm-expand-icon`}></i>
                  </div>
                </div>

                {isExpanded && (
                  <div className="sm-asgn-detail">
                    {a.description && <p className="sm-asgn-desc">{a.description}</p>}
                    <div className="sm-progress-row">
                      <label className="sm-progress-label">Update Progress:</label>
                      <div className="sm-progress-btns">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            className={`sm-prog-btn${status === s ? " selected" : ""}`}
                            style={status === s ? { background: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].color, borderColor: STATUS_STYLE[s].color } : {}}
                            onClick={() => handleStatusChange(a.id, s)}
                            disabled={saving === a.id}
                          >
                            {saving === a.id && status === s
                              ? <i className="bx bx-loader-alt bx-spin"></i>
                              : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignment;
