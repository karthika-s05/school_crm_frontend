import React, { useState, useEffect } from "react";
import { getToken } from "../../services/auth";
import { getStudentAssignment, updateAssignmentProgress } from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Submitted"];

const STATUS_STYLE = {
  "Not Started": { bg: "#f1f5f9", color: "#64748b", icon: "bx-circle" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb", icon: "bx-loader-circle" },
  Submitted:     { bg: "#dcfce7", color: "#16a34a", icon: "bx-check-circle" },
};

const StudentAssignment = () => {
  const token = getToken();

  const [assignments, setAssignments] = useState([]);
  const [progress,    setProgress]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(null);
  const [filter,      setFilter]      = useState("All");
  const [expanded,    setExpanded]    = useState(null);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }
    setLoading(true);
    setError("");
    runApi(() => getStudentAssignment(token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setAssignments(list);
        const init = {};
        list.forEach(a => { init[a.id] = a.progressStatus || "Not Started"; });
        setProgress(init);
      },
      onError: () => {
        setAssignments([]);
        setError("Unable to load assignments.");
      },
    }).finally(() => setLoading(false));
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    const previous = progress[id] || "Not Started";
    if (previous === newStatus) return;
    setProgress(p => ({ ...p, [id]: newStatus }));
    setSaving(id);
    const ok = await runApi(() => updateAssignmentProgress({ id, status: newStatus }, token), {
      successMsg: "Progress updated!",
    });
    if (!ok) {
      setProgress((p) => ({ ...p, [id]: previous }));
    }
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

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="sm-page">
      {/* Hero header */}
      {/* <div className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-icon"><i className="bx bxs-notepad"></i></div>
          <div>
            <h2 className="sm-hero-title">My Assignments</h2>
            <p className="sm-hero-sub">View assigned tasks and update your submission progress</p>
          </div>
        </div>
        <div className="sm-hero-stats">
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts.All}</div>
            <div className="sm-hero-stat-label">Total</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts["In Progress"]}</div>
            <div className="sm-hero-stat-label">In Progress</div>
          </div>
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{counts.Submitted}</div>
            <div className="sm-hero-stat-label">Submitted</div>
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
          <i className="bx bx-notepad"></i>
          <p className="sm-empty-title">
            {filter !== "All" ? `No "${filter}" assignments` : "No Assignments Available"}
          </p>
          <p className="sm-empty-sub">
            {filter !== "All"
              ? "Try a different filter to see other assignments."
              : "New assignments from your teachers will appear here."}
          </p>
        </div>
      ) : (
        <div className="sm-list">
          {filtered.map((a, i) => {
            const status  = progress[a.id] || "Not Started";
            const style   = STATUS_STYLE[status];
            const open    = isOpen(a);
            const isExpanded = expanded === (a.id || i);
            return (
              <div className="sm-asgn-card" key={a.id || i}>
                <div className="sm-asgn-main" onClick={() => setExpanded(isExpanded ? null : (a.id || i))}>
                  <div className="sm-asgn-left">
                    <div className="sm-asgn-icon" style={{ background: style.bg, color: style.color }}>
                      <i className={`bx ${style.icon}`}></i>
                    </div>
                    <div>
                      <div className="sm-asgn-title">{a.title}</div>
                      <div className="sm-asgn-meta">
                        <span className="sm-subject-pill">{a.subjectName || a.subject || "Subject"}</span>
                        <span className="sm-date-text">
                          <i className="bx bx-calendar"></i> {a.startDate} – {a.endDate}
                        </span>
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
                    <label className="sm-progress-label">My Progress</label>
                    <div className="sm-segment">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          className={status === s ? "selected" : ""}
                          style={status === s ? { color: STATUS_STYLE[s].color } : {}}
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
