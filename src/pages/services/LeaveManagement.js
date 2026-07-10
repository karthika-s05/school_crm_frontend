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
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import "../../component/modules.css";

const EMPTY_FORM = {
  startDate: "", endDate: "", reason: "",
  leaveTypeId: "", leaveTime: "Full day",
  classId: "", sectionId: "",
};

const STATUS_COLOR = {
  Approved: "mod-badge-green",
  Rejected:  "mod-badge-red",
  Pending:   "mod-badge-yellow",
};

export default function LeaveManagement() {
  const token = getToken();
  const [tab,           setTab]           = useState("student");
  const [leaveTypes,    setLeaveTypes]    = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [staffLeaves,   setStaffLeaves]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      runApi(() => getLeaveTypes(token),    { onSuccess: (res) => setLeaveTypes(res.data    || []) }),
      runApi(() => getStudentLeave(token, Number(form.classId) || 0, Number(form.sectionId) || 0),  { onSuccess: (res) => setStudentLeaves(res.data || []) }),
      runApi(() => getStaffLeave(token),    { onSuccess: (res) => setStaffLeaves(res.data   || []) }),
    ]);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusUpdate = async (id, status, type) => {
    let remarks = "";
    if (status === "Approved" || status === "Rejected") {
      remarks = window.prompt(`Enter remarks for ${status.toLowerCase()} leave request:`, "");
      if (remarks === null) return; // user cancelled prompt
    }
    const fn = type === "student"
      ? () => updateStudentLeaveStatus({ id, status, remarks }, token)
      : () => updateStaffLeaveStatus({ id, status, remarks }, token);
    await runApi(fn, { successMsg: "Leave status updated", onSuccess: loadData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = tab === "student"
      ? { startDate: form.startDate, endDate: form.endDate, reason: form.reason,
          classId: Number(form.classId) || 0, sectionId: Number(form.sectionId) || 0 }
      : { startDate: form.startDate, endDate: form.endDate, reason: form.reason,
          leaveTypeId: Number(form.leaveTypeId), leaveTime: form.leaveTime };
    const fn = tab === "student"
      ? () => createStudentLeave(body, token)
      : () => createStaffLeave(body, token);
    await runApi(fn, {
      successMsg: "Leave request submitted",
      onSuccess: () => { setForm(EMPTY_FORM); setShowForm(false); loadData(); },
    });
    setSubmitting(false);
  };

  const rows = tab === "student" ? studentLeaves : staffLeaves;

  return (
    <div className="mod-wrap">

      {/* Header */}
      <div className="mod-header">
        <div className="mod-pills">
          <span className="mod-pill blue"><i className="bx bx-calendar"></i>{rows.length} Records</span>
          <button className="mod-btn mod-btn-primary" onClick={() => setShowForm((p) => !p)}>
            <i className={`bx ${showForm ? "bx-x" : "bx-plus"}`}></i>
            {showForm ? "Cancel" : "Apply Leave"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mod-filter-card" style={{ padding: "10px 16px" }}>
        <div className="mod-tabs">
          {["student", "staff"].map((t) => (
            <button
              key={t}
              className={`mod-tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              <i className={`bx ${t === "student" ? "bx-user" : "bx-briefcase"}`}></i>{" "}
              {t === "student" ? "Student Leave" : "Staff Leave"}
            </button>
          ))}
        </div>
        <button className="mod-btn mod-btn-ghost" style={{ marginLeft: "auto" }} onClick={loadData}>
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <div className="mod-filter-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
            <i className="bx bx-edit" style={{ marginRight: 6 }}></i>
            Apply {tab === "student" ? "Student" : "Staff"} Leave
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>

              <div className="mod-filter-group">
                <label>Start Date</label>
                <input className="mod-input" type="date" required
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>

              <div className="mod-filter-group">
                <label>End Date</label>
                <input className="mod-input" type="date" required
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>

              {tab === "student" && (
                <>
                  <div className="mod-filter-group">
                    <label>Class ID</label>
                    <input className="mod-input" type="number" placeholder="Enter class ID" required
                      value={form.classId}
                      onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} />
                  </div>
                  <div className="mod-filter-group">
                    <label>Section ID</label>
                    <input className="mod-input" type="number" placeholder="Enter section ID" required
                      value={form.sectionId}
                      onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))} />
                  </div>
                </>
              )}

              {tab === "staff" && (
                <>
                  <div className="mod-filter-group">
                    <label>Leave Type</label>
                    <select className="mod-input" required value={form.leaveTypeId}
                      onChange={(e) => setForm((p) => ({ ...p, leaveTypeId: e.target.value }))}>
                      <option value="">Select leave type</option>
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.id}>{lt.leaveType || lt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mod-filter-group">
                    <label>Leave Time</label>
                    <select className="mod-input" value={form.leaveTime}
                      onChange={(e) => setForm((p) => ({ ...p, leaveTime: e.target.value }))}>
                      <option value="Full day">Full day</option>
                      <option value="Half day">Half day</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mod-filter-group" style={{ gridColumn: "1 / -1" }}>
                <label>Reason</label>
                <input className="mod-input" placeholder="Enter reason for leave" required
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button type="button" className="mod-btn mod-btn-ghost"
                onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }}>
                Cancel
              </button>
              <button type="submit" className="mod-btn mod-btn-primary" disabled={submitting}>
                <i className="bx bx-send"></i> {submitting ? "Submitting..." : "Submit Leave"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="mod-table-card">
        <div className="mod-table-toolbar">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {tab === "student" ? "Student" : "Staff"} Leave Records
          </span>
          <span className="mod-pill blue">{rows.length} records</span>
        </div>

        <div className="mod-table-body-wrap">
          {loading ? (
            <div className="mod-loading"><div className="mod-spinner"></div> Loading...</div>
          ) : rows.length === 0 ? (
            <div className="mod-empty"><i className="bx bx-calendar-x"></i><p>No leave records found</p></div>
          ) : (
            <table className="mod-table">
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{i + 1}</td>
                    <td>{row.startDate || row.fromDate || "-"}</td>
                    <td>{row.endDate   || row.toDate   || "-"}</td>
                    <td>{row.reason || "-"}</td>
                    <td>{row.noOfDays || "-"}</td>
                    <td>
                      <span className={`mod-badge ${STATUS_COLOR[row.status] || "mod-badge-gray"}`}>
                        {row.status || "Pending"}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.remarks || ""}>
                      {row.remarks || "-"}
                    </td>
                    <td>
                      <select
                        className="mod-input"
                        style={{ padding: "5px 10px", fontSize: 12, minWidth: 110 }}
                        value={row.status || "Pending"}
                        onChange={(e) => handleStatusUpdate(row.id, e.target.value, tab)}
                      >
                        {["Pending", "Approved", "Rejected"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
