import React, { useCallback, useEffect, useState } from "react";
import "./attendance.css";
import { getMyStaffAttendanceV2 } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import {
  STAFF_STATUSES,
  STATUS,
  countByStatus,
  currentMonthISO,
  normalizeStatus,
  statusMeta,
} from "./constants";
import AttendanceHistoryTable from "./components/AttendanceHistoryTable";
import { AttendanceStatCards } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup } from "./components/AttendanceFilterBar";

const normalizeMine = (data) => {
  const payload = Array.isArray(data) ? { history: data } : data || {};
  const history = (payload.history || payload.records || []).map((r, i) => ({
    id: r.id ?? `${r.date}-${i}`,
    name: "",
    subLabel: "",
    date: r.date || r.attendanceDate || "-",
    extra: {},
    status: normalizeStatus(r.status),
    remarks: r.remarks || "",
    canEdit: false,
  }));
  // Backend sends monthly totals as { daysMarked, present, absent, onLeave,
  // late, halfDay, percentage }; map them to the stat-card keys.
  const m = payload.monthly || payload.summary || null;
  const summary = m
    ? {
        workingDays: m.daysMarked ?? m.workingDays,
        present: m.present,
        absent: m.absent,
        leave: m.onLeave ?? m.leave,
        late: m.late,
        halfday: m.halfDay ?? m.halfday,
        percentage: m.percentage,
      }
    : null;
  return { summary, history };
};

/** Logged-in staff member's own attendance history and month summary. */
const MyStaffAttendance = () => {
  const token = getToken();
  const [month, setMonth] = useState(currentMonthISO());
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    await runApi(
      () => getMyStaffAttendanceV2({ month }, token),
      {
        onSuccess: (res) => {
          const { summary: s, history: h } = normalizeMine(res.data);
          setSummary(s);
          // Backend returns recent history across months; show the chosen month
          setHistory(h.filter((r) => String(r.date).startsWith(month)));
        },
        onError: () => {
          setSummary(null);
          setHistory([]);
          setError("Could not load your attendance.");
        },
      }
    );
    setLoading(false);
  }, [token, month]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = countByStatus(history, STAFF_STATUSES);
  const workingDays = summary?.workingDays ?? summary?.totalDays ?? history.length;
  const presentCount = summary?.present ?? counts[STATUS.PRESENT];
  const percentage =
    summary?.percentage ??
    (workingDays ? Math.round((presentCount / workingDays) * 100) : 0);

  const statItems = [
    { label: "Working Days", value: workingDays, color: "#2d3a8c", bg: "#eef0fb", icon: "bx bx-calendar" },
    ...STAFF_STATUSES.map((s) => {
      const meta = statusMeta(s);
      return {
        label: s,
        value: summary?.[meta.key] ?? counts[s],
        color: meta.color,
        bg: meta.bg,
        icon: meta.icon,
      };
    }),
    { label: "Attendance %", value: `${percentage}%`, color: "#d97706", bg: "#fef3c7", icon: "bx bx-line-chart" },
  ];

  return (
    <div className="av2-wrap">
      {/* <div className="av2-header">
        <div>
          <h2 className="av2-title">My Attendance</h2>
          <p className="av2-sub">Your own attendance history and monthly summary</p>
        </div>
      </div> */}

      <AttendanceFilterBar>
        <FilterGroup label="Month">
          <input
            type="month"
            className="av2-input"
            value={month}
            max={currentMonthISO()}
            onChange={(e) => setMonth(e.target.value)}
          />
        </FilterGroup>
        <button type="button" className="av2-btn av2-btn-primary" onClick={load}>
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </AttendanceFilterBar>

      <AttendanceStatCards items={statItems} />

      <AttendanceHistoryTable
        rows={history}
        loading={loading}
        error={error}
        onRetry={load}
        emptyText="No attendance recorded for this month"
        showName={false}
        searchPlaceholder="Search by date or status…"
      />
    </div>
  );
};

export default MyStaffAttendance;
