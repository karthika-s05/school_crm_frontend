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

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

export default function LeaveManagement() {
  const token = getToken();
  const [tab, setTab] = useState("student");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [staffLeaves, setStaffLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveTypeId: "",
    leaveTime: "Full day",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      runApi(() => getLeaveTypes(token), {
        onSuccess: (res) => setLeaveTypes(res.data || []),
      }),
      runApi(() => getStudentLeave(token), {
        onSuccess: (res) => setStudentLeaves(res.data || []),
      }),
      runApi(() => getStaffLeave(token), {
        onSuccess: (res) => setStaffLeaves(res.data || []),
      }),
    ]);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (id, status, type) => {
    const fn =
      type === "student"
        ? () => updateStudentLeaveStatus({ id, status }, token)
        : () => updateStaffLeaveStatus({ id, status }, token);
    await runApi(fn, {
      successMsg: "Leave status updated",
      onSuccess: () => loadData(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body =
      tab === "student"
        ? {
            startDate: form.startDate,
            endDate: form.endDate,
            reason: form.reason,
          }
        : {
            startDate: form.startDate,
            endDate: form.endDate,
            reason: form.reason,
            leaveTypeId: Number(form.leaveTypeId),
            leaveTime: form.leaveTime,
          };
    const fn =
      tab === "student"
        ? () => createStudentLeave(body, token)
        : () => createStaffLeave(body, token);
    await runApi(fn, {
      successMsg: "Leave request submitted",
      onSuccess: () => {
        setForm({ startDate: "", endDate: "", reason: "", leaveTypeId: "", leaveTime: "Full day" });
        loadData();
      },
    });
  };

  const rows = tab === "student" ? studentLeaves : staffLeaves;

  return (
    <div style={{ padding: "24px 28px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Leave Management</h2>
      <p style={{ color: "#64748b", marginBottom: 20 }}>Apply for leave and approve staff or student requests.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["student", "staff"].map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? "fw-btn-fill btn-gradient-add" : "fw-btn-fill"}
            onClick={() => setTab(t)}
          >
            {t === "student" ? "Student Leave" : "Staff Leave"}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 24,
          padding: 16,
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <input
          className="wz-input"
          type="date"
          required
          value={form.startDate}
          onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
        />
        <input
          className="wz-input"
          type="date"
          required
          value={form.endDate}
          onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
        />
        {tab === "staff" && (
          <>
            <select
              className="wz-input"
              required
              value={form.leaveTypeId}
              onChange={(e) => setForm((p) => ({ ...p, leaveTypeId: e.target.value }))}
            >
              <option value="">Leave type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.leaveType || lt.name}</option>
              ))}
            </select>
            <select
              className="wz-input"
              value={form.leaveTime}
              onChange={(e) => setForm((p) => ({ ...p, leaveTime: e.target.value }))}
            >
              <option value="Full day">Full day</option>
              <option value="Half day">Half day</option>
            </select>
          </>
        )}
        <input
          className="wz-input"
          placeholder="Reason"
          required
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
        />
        <button type="submit" className="fw-btn-fill btn-gradient-add">
          Submit leave
        </button>
      </form>

      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        {loading ? (
          <p style={{ padding: 24, color: "#64748b" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ padding: 24, color: "#64748b" }}>No leave records.</p>
        ) : (
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.startDate || row.fromDate || "-"}</td>
                  <td>{row.endDate || row.toDate || "-"}</td>
                  <td>{row.reason || "-"}</td>
                  <td>{row.status || "Pending"}</td>
                  <td>
                    <select
                      className="wz-input"
                      value={row.status || "Pending"}
                      onChange={(e) => handleStatusUpdate(row.id, e.target.value, tab)}
                    >
                      {STATUS_OPTIONS.map((s) => (
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
  );
}
