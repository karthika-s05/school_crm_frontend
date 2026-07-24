import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import { getStafflist, markStaffAttendanceV2 } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { STAFF_STATUSES, countByStatus, normalizeStatus, todayISO } from "./constants";
import AttendanceMarkingTable from "./components/AttendanceMarkingTable";
import { AttendanceSummaryPills } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup } from "./components/AttendanceFilterBar";

/** Admin: mark staff attendance for a date. */
const StaffAttendanceMark = () => {
  const token = getToken();
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    await runApi(() => getStafflist("0", token), {
      onSuccess: (res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setRows(
          list.map((s) => ({
            id: s.staffId ?? s.id,
            name: s.staffName || s.name || "-",
            subLabel: s.designation || s.staffId || "-",
            status: "",
            remarks: "",
          }))
        );
      },
      onError: () => {
        setRows([]);
        setError("Could not load the staff list.");
      },
    });
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleRowChange = (id, patch) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleMarkAll = (status) => {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    const unmarked = rows.filter((r) => !normalizeStatus(r.status)).length;
    if (unmarked > 0) {
      toast.warning(`${unmarked} staff member(s) not marked yet`);
      return;
    }
    setSaving(true);
    await runApi(
      () =>
        markStaffAttendanceV2(
          {
            date,
            entries: rows.map((r) => ({
              staffId: r.id,
              status: r.status,
              remarks: r.remarks || "",
            })),
          },
          token
        ),
      {
        successMsg: "Staff attendance saved successfully",
        onError: (err) =>
          toast.error(err?.response?.data?.message || err?.message || "Failed to save staff attendance"),
      }
    );
    setSaving(false);
  };

  const counts = countByStatus(rows, STAFF_STATUSES);

  return (
    <div className="av2-wrap">
      <div className="av2-header">
        {/* <div>
          <h2 className="av2-title">Staff Attendance</h2>
          <p className="av2-sub">Mark daily attendance for all staff members</p>
        </div> */}
        <AttendanceSummaryPills counts={counts} statuses={STAFF_STATUSES} />
      </div>

      <AttendanceFilterBar>
        <FilterGroup label="Date">
          <input
            type="date"
            className="av2-input"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </FilterGroup>
      </AttendanceFilterBar>

      <AttendanceMarkingTable
        rows={rows}
        statuses={STAFF_STATUSES}
        onChange={handleRowChange}
        onMarkAll={handleMarkAll}
        loading={loading}
        error={error}
        onRetry={loadStaff}
        emptyText="No staff members found"
        subLabelHeader="Designation"
      />

      <div className="av2-footer">
        <button
          type="button"
          className="av2-btn av2-btn-ghost"
          onClick={() => setRows((prev) => prev.map((r) => ({ ...r, status: "", remarks: "" })))}
          disabled={rows.length === 0}
        >
          <i className="bx bx-reset"></i> Reset
        </button>
        <button
          type="button"
          className="av2-btn av2-btn-primary"
          onClick={handleSave}
          disabled={saving || rows.length === 0}
        >
          <i className="bx bx-send"></i> {saving ? "Saving…" : "Save Attendance"}
        </button>
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default StaffAttendanceMark;
