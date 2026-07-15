import React, { useCallback, useEffect, useState } from "react";
import {
  createStaffLeave,
  createStudentLeave,
  getLeaveTypes,
  getStaffLeave,
  getStudentLeave,
  updateStaffLeaveStatus,
  updateStudentLeaveStatus,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../component/modules.css";
import "./leave.css";

/* ─── Constants ─────────────────────────────────────────── */
const EMPTY_FORM = {
  startDate: "", endDate: "", reason: "",
  leaveTypeId: "", leaveTime: "Full day",
};

const STATUS_COLOR = {
  Approved: "mod-badge-green",
  Rejected:  "mod-badge-red",
  Pending:   "mod-badge-yellow",
};

const STATUS_ICON = {
  Approved: "bx-check-circle",
  Rejected:  "bx-x-circle",
  Pending:   "bx-time-five",
};

/* ─── Date helpers ───────────────────────────────────────── */
const calcDays = (start, end, leaveTime) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  const total = Math.floor((e - s) / 86400000) + 1;
  return leaveTime === "Half day" ? total / 2 : total;
};

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return dateStr; }
};

/* ─── Apply Leave Form ───────────────────────────────────── */
function ApplyLeaveForm({ isStaff, leaveTypes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const days = calcDays(form.startDate, form.endDate, form.leaveTime);
  const dateErr = form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateErr) { toast.error("End date cannot be before start date."); return; }
    if (!form.reason.trim()) { toast.error("Please enter a reason for leave."); return; }
    onSubmit(form);
  };

  return (
    <div className="lv-form-card">
      <div className="lv-form-title">
        <i className="bx bx-edit-alt"></i>
        Apply for Leave
        {days > 0 && (
          <span className="lv-days-pill">
            <i className="bx bx-calendar"></i> {days} {days === 1 ? "day" : days === 0.5 ? "half day" : "days"}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="lv-form-grid">
          {/* Start Date */}
          <div className="mod-form-group">
            <label>From Date <span className="lv-required">*</span></label>
            <input className="mod-input" type="date" required value={form.startDate} onChange={set("startDate")} />
          </div>

          {/* End Date */}
          <div className="mod-form-group">
            <label>To Date <span className="lv-required">*</span></label>
            <input
              className={`mod-input${dateErr ? " lv-input-err" : ""}`}
              type="date" required
              value={form.endDate}
              onChange={set("endDate")}
              min={form.startDate || undefined}
            />
            {dateErr && <span className="lv-err-msg"><i className="bx bx-error"></i> End date must be after start date</span>}
          </div>

          {/* Leave Type (Staff/Admin only) */}
          {isStaff && (
            <div className="mod-form-group">
              <label>Leave Type <span className="lv-required">*</span></label>
              <select className="mod-input" required value={form.leaveTypeId} onChange={set("leaveTypeId")}>
                <option value="">Select leave type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.leaveType || lt.name || lt.leaveTypeName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Leave Time (Staff/Admin only) */}
          {isStaff && (
            <div className="mod-form-group">
              <label>Leave Duration</label>
              <select className="mod-input" value={form.leaveTime} onChange={set("leaveTime")}>
                <option value="Full day">Full Day</option>
                <option value="Half day">Half Day</option>
              </select>
            </div>
          )}

          {/* Reason */}
          <div className="mod-form-group lv-full-col">
            <label>Reason <span className="lv-required">*</span></label>
            <textarea
              className="mod-input lv-textarea"
              required
              placeholder="Describe the reason for your leave request…"
              value={form.reason}
              onChange={set("reason")}
            />
          </div>
        </div>

        <div className="lv-form-actions">
          <button type="button" className="mod-btn mod-btn-ghost" onClick={onCancel}>
            <i className="bx bx-x"></i> Cancel
          </button>
          <button type="submit" className="mod-btn mod-btn-primary" disabled={submitting || dateErr}>
            {submitting
              ? <><span className="lv-spinner"></span> Submitting…</>
              : <><i className="bx bx-send"></i> Submit Leave Request</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Approve / Reject inline buttons ───────────────────── */
function StatusActions({ row, onUpdate, type }) {
  const [busy, setBusy] = useState(false);
  if (row.status === "Approved" || row.status === "Rejected") return null;

  const handle = async (status) => {
    const remarks = window.prompt(`Enter remarks for ${status.toLowerCase()} leave (optional):`, "") ?? "";
    if (remarks === null) return;
    setBusy(true);
    await onUpdate(row.id, status, remarks, type);
    setBusy(false);
  };

  return (
    <div className="lv-action-row">
      <button
        className="lv-action-btn approve"
        disabled={busy}
        title="Approve"
        onClick={() => handle("Approved")}
      >
        <i className="bx bx-check"></i> Approve
      </button>
      <button
        className="lv-action-btn reject"
        disabled={busy}
        title="Reject"
        onClick={() => handle("Rejected")}
      >
        <i className="bx bx-x"></i> Reject
      </button>
    </div>
  );
}

/* ─── Leave Table ────────────────────────────────────────── */
function LeaveTable({ rows, loading, showActions, onUpdate, type, emptyMsg }) {
  if (loading) return <div className="mod-loading"><div className="mod-spinner"></div> Loading…</div>;
  if (!rows.length) return <div className="mod-empty"><i className="bx bx-calendar-x"></i><p>{emptyMsg}</p></div>;

  return (
    <div className="lv-table-wrap">
      <table className="mod-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Type</th>
            <th>Status</th>
            <th>Remarks</th>
            {showActions && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              <td>{i + 1}</td>
              <td>
                <div className="mod-avatar-cell">
                  <div className="mod-avatar" style={{ background: "#2D3A8C" }}>
                    {(row.studentName || row.staffName || row.userName || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="mod-cell-name">{row.studentName || row.staffName || row.userName || "—"}</div>
                    {row.className && <div className="mod-cell-sub">{row.className}{row.sectionName ? ` – ${row.sectionName}` : ""}</div>}
                  </div>
                </div>
              </td>
              <td>{fmt(row.startDate || row.fromDate)}</td>
              <td>{fmt(row.endDate   || row.toDate)}</td>
              <td><span className="lv-days-chip">{row.noOfDays ?? "—"}</span></td>
              <td className="lv-reason-cell" title={row.reason || ""}>{row.reason || "—"}</td>
              <td>{row.leaveType || row.leaveTypeName || "—"}</td>
              <td>
                <span className={`mod-badge ${STATUS_COLOR[row.status] || "mod-badge-gray"}`}>
                  <i className={`bx ${STATUS_ICON[row.status] || "bx-circle"}`}></i>
                  {row.status || "Pending"}
                </span>
              </td>
              <td className="lv-reason-cell" title={row.remarks || ""}>{row.remarks || "—"}</td>
              {showActions && (
                <td>
                  <StatusActions row={row} onUpdate={onUpdate} type={type} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
  return (
    <div className="mod-stat-card">
      <div className="mod-stat-icon" style={{ background: `${color}20`, color }}>{icon}</div>
      <div className="mod-stat-body">
        <div className="mod-stat-val">{value}</div>
        <div className="mod-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   MAIN COMPONENT — role-based rendering
═════════════════════════════════════════════════════════ */
export default function LeaveManagement() {
  const token = getToken();
  const role  = getUserData("role");     // "Admin" | "Staff" | "Student"
  const isAdmin   = role === "Admin";
  const isStaff   = role === "Staff" || role === "Admin"; // Admin also uses staff leave API
  const isStudent = role === "Student";

  /* ── State ── */
  const [tab,           setTab]           = useState(isStudent ? "myLeave" : isAdmin ? "staffLeaves" : "studentLeaves");
  const [leaveTypes,    setLeaveTypes]    = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [staffLeaves,   setStaffLeaves]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [showForm,      setShowForm]      = useState(false);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    const calls = [
      runApi(() => getLeaveTypes(token), { onSuccess: (res) => setLeaveTypes(res.data || []) }),
    ];
    if (!isStudent) {
      calls.push(
        runApi(() => getStudentLeave(token, 0, 0), { onSuccess: (res) => setStudentLeaves(res.data || []) }),
        runApi(() => getStaffLeave(token),          { onSuccess: (res) => setStaffLeaves(res.data   || []) }),
      );
    } else {
      // Students see only their own leave (handled by JWT in backend)
      calls.push(
        runApi(() => getStudentLeave(token, 0, 0), { onSuccess: (res) => setStudentLeaves(res.data || []) }),
      );
    }
    await Promise.all(calls);
    setLoading(false);
  }, [token, isStudent]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Status update ── */
  const handleStatusUpdate = async (id, status, remarks, type) => {
    const fn = type === "student"
      ? () => updateStudentLeaveStatus({ id, status, remarks }, token)
      : () => updateStaffLeaveStatus({ id, status, remarks }, token);
    await runApi(fn, { successMsg: `Leave ${status.toLowerCase()} successfully`, onSuccess: loadData });
  };

  /* ── Submit leave application ── */
  const handleSubmit = async (form) => {
    setSubmitting(true);
    const body = isStudent
      ? { startDate: form.startDate, endDate: form.endDate, reason: form.reason }
      : { startDate: form.startDate, endDate: form.endDate, reason: form.reason,
          leaveTypeId: Number(form.leaveTypeId), leaveTime: form.leaveTime };
    const fn = isStudent ? () => createStudentLeave(body, token) : () => createStaffLeave(body, token);
    await runApi(fn, {
      successMsg: "Leave request submitted successfully!",
      onSuccess: () => { setShowForm(false); loadData(); },
    });
    setSubmitting(false);
  };

  /* ── Stats ── */
  const statsOf = (list) => ({
    total:    list.length,
    pending:  list.filter(r => (r.status || "Pending") === "Pending").length,
    approved: list.filter(r => r.status === "Approved").length,
    rejected: list.filter(r => r.status === "Rejected").length,
  });

  const currentList = tab === "staffLeaves" ? staffLeaves : studentLeaves;
  const stats = statsOf(currentList);

  /* ── Tab config ── */
  const tabs = isStudent
    ? [{ id: "myLeave",      label: "My Leave History", icon: "bx-history" }]
    : isAdmin
    ? [
        { id: "staffLeaves", label: "Staff Leaves",     icon: "bx-briefcase" },
        { id: "myLeave",     label: "Apply My Leave",   icon: "bx-calendar-plus" },
      ]
    : [
        { id: "studentLeaves", label: "Student Leaves", icon: "bx-user" },
        { id: "myLeave",       label: "My Leave",       icon: "bx-calendar-plus" },
      ];

  return (
    <div className="mod-wrap">
      {/* ── Header ── */}
      <div className="mod-header">
        <div>
          {/* <h2 className="mod-title">
            <i className="bx bx-calendar-check" style={{ color: "#2D3A8C", marginRight: 8 }}></i>
            Leave Management
          </h2> */}
          {/* <p className="mod-sub">
            {isAdmin && "Manage staff leave requests and apply your own leave"}
            {role === "Staff" && "Manage student leave requests and apply your own leave"}
            {isStudent && "Apply for leave and view your leave history"}
          </p> */}
        </div>
        <div className="mod-pills">
          {!isStudent && tab !== "myLeave" && (
            <>
              <span className="mod-pill yellow"><i className="bx bx-time"></i>{stats.pending} Pending</span>
              <span className="mod-pill green"><i className="bx bx-check"></i>{stats.approved} Approved</span>
              <span className="mod-pill orange"><i className="bx bx-x"></i>{stats.rejected} Rejected</span>
            </>
          )}
          <button className="mod-btn mod-btn-primary" onClick={() => setShowForm((p) => !p)}>
            <i className={`bx ${showForm ? "bx-x" : "bx-plus"}`}></i>
            {showForm ? "Cancel" : "Apply Leave"}
          </button>
        </div>
      </div>

      {/* ── Stat Row (non-student list views) ── */}
      {!isStudent && tab !== "myLeave" && (
        <div className="mod-stat-row">
          <StatCard icon={<i className="bx bx-list-ul"></i>}     label="Total Requests" value={stats.total}    color="#2D3A8C" />
          <StatCard icon={<i className="bx bx-time-five"></i>}    label="Pending"        value={stats.pending}  color="#d97706" />
          <StatCard icon={<i className="bx bx-check-circle"></i>} label="Approved"       value={stats.approved} color="#16a34a" />
          <StatCard icon={<i className="bx bx-x-circle"></i>}     label="Rejected"       value={stats.rejected} color="#ef4444" />
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="mod-filter-card" style={{ padding: "10px 16px" }}>
        <div className="mod-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`mod-tab${tab === t.id ? " active" : ""}`}
              onClick={() => { setTab(t.id); setShowForm(false); }}
            >
              <i className={`bx ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>
        <button className="mod-btn mod-btn-ghost" style={{ marginLeft: "auto" }} onClick={loadData}>
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </div>

      {/* ── Apply Leave Form ── */}
      {showForm && (
        <ApplyLeaveForm
          isStaff={!isStudent}
          leaveTypes={leaveTypes}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {/* ── Content ── */}
      {tab === "myLeave" ? (
        /* My Leave History */
        <div className="mod-table-card">
          <div className="mod-table-toolbar">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              <i className="bx bx-history" style={{ marginRight: 6 }}></i> My Leave History
            </span>
            <span className="mod-pill blue"><i className="bx bx-calendar"></i>{(isStudent ? studentLeaves : staffLeaves).length} records</span>
          </div>
          <div className="mod-table-body-wrap">
            <LeaveTable
              rows={isStudent ? studentLeaves : staffLeaves}
              loading={loading}
              showActions={false}
              type={isStudent ? "student" : "staff"}
              emptyMsg="No leave requests found. Click 'Apply Leave' to submit one."
            />
          </div>
        </div>
      ) : tab === "staffLeaves" ? (
        /* Admin view — Staff Leave list + Approve/Reject */
        <div className="mod-table-card">
          <div className="mod-table-toolbar">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              <i className="bx bx-briefcase" style={{ marginRight: 6 }}></i> Staff Leave Requests
            </span>
            <span className="mod-pill blue"><i className="bx bx-list-ul"></i>{staffLeaves.length} records</span>
          </div>
          <div className="mod-table-body-wrap">
            <LeaveTable
              rows={staffLeaves}
              loading={loading}
              showActions={true}
              onUpdate={handleStatusUpdate}
              type="staff"
              emptyMsg="No staff leave requests found."
            />
          </div>
        </div>
      ) : (
        /* Staff view — Student Leave list + Approve/Reject */
        <div className="mod-table-card">
          <div className="mod-table-toolbar">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              <i className="bx bx-user" style={{ marginRight: 6 }}></i> Student Leave Requests
            </span>
            <span className="mod-pill blue"><i className="bx bx-list-ul"></i>{studentLeaves.length} records</span>
          </div>
          <div className="mod-table-body-wrap">
            <LeaveTable
              rows={studentLeaves}
              loading={loading}
              showActions={true}
              onUpdate={handleStatusUpdate}
              type="student"
              emptyMsg="No student leave requests found."
            />
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
