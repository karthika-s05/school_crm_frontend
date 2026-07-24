import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import {
  editStaffAttendanceV2,
  getStafflist,
  getStaffAttendanceViewV2,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { STAFF_STATUSES, countByStatus, normalizeStatus, personName, todayISO } from "./constants";
import AttendanceHistoryTable from "./components/AttendanceHistoryTable";
import { AttendanceSummaryPills } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup, FilterSelect } from "./components/AttendanceFilterBar";
import EditAttendanceModal from "./components/EditAttendanceModal";

const normalizeRecords = (data, globalCanEdit) => {
  const list = Array.isArray(data) ? data : data?.records || [];
  return list.map((r, i) => ({
    id: r.id ?? `${r.staffId}-${r.date}-${i}`,
    recordId: r.id,
    staffId: r.staffId,
    name: personName(r),
    subLabel: r.designation || r.staffId || "-",
    date: r.date || r.attendanceDate || "-",
    extra: {},
    status: normalizeStatus(r.status),
    remarks: r.remarks || "",
    // Only rows that were actually marked (have a record id) can be edited
    canEdit: globalCanEdit === true && !!r.id,
    raw: r,
  }));
};

/** Admin: view (and edit, when allowed) staff attendance records. */
const StaffAttendanceView = () => {
  const token = getToken();

  const [staffOptions, setStaffOptions] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayISO());

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!token) return;
    getStafflist("0", token)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setStaffOptions(
          list.map((s) => ({ id: s.staffId ?? s.id, name: s.staffName || s.name || String(s.staffId) }))
        );
      })
      .catch(() => setStaffOptions([]));
  }, [token]);

  const loadRecords = useCallback(async () => {
    if (!token || !date) return;
    setLoading(true);
    setError("");
    await runApi(() => getStaffAttendanceViewV2({ date }, token), {
      onSuccess: (res) => setRecords(normalizeRecords(res.data, res.canEdit)),
      onError: () => {
        setRecords([]);
        setError("Could not load staff attendance records.");
      },
    });
    setLoading(false);
  }, [token, date]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleEditSave = async ({ status, remarks }) => {
    const r = editing;
    const ok = await runApi(
      () =>
        editStaffAttendanceV2(
          { id: r.recordId, staffId: r.staffId, date: r.date, status, remarks },
          token
        ),
      {
        successMsg: "Staff attendance updated",
        onError: (err) =>
          toast.error(err?.response?.data?.message || err?.message || "Failed to update record"),
      }
    );
    if (ok) {
      setEditing(null);
      loadRecords();
    }
  };

  const counts = countByStatus(records, STAFF_STATUSES);

  return (
    <div className="av2-wrap">
      <div className="av2-header">
        {/* <div>
          <h2 className="av2-title">View Staff Attendance</h2>
          <p className="av2-sub">Browse and edit staff attendance records</p>
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
        <FilterGroup label="Staff Member">
          <FilterSelect value={staffId} onChange={setStaffId} options={staffOptions} placeholder="All staff" />
        </FilterGroup>
        <button type="button" className="av2-btn av2-btn-primary" onClick={loadRecords}>
          <i className="bx bx-search"></i> Apply
        </button>
      </AttendanceFilterBar>

      <AttendanceHistoryTable
        rows={staffId ? records.filter((r) => String(r.staffId) === String(staffId)) : records}
        onEdit={(r) => setEditing(r)}
        loading={loading}
        error={error}
        onRetry={loadRecords}
        emptyText="No staff attendance records for the selected filters"
        subLabelHeader="Designation"
        searchPlaceholder="Search staff…"
      />

      {editing && (
        <EditAttendanceModal
          record={editing}
          statuses={STAFF_STATUSES}
          onSave={handleEditSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default StaffAttendanceView;
