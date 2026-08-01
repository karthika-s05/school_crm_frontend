import React, { useCallback, useEffect, useState } from "react";
import "./attendance.css";
import { getMyAttendanceSummaryV2 } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import {
  STATUS,
  STUDENT_STATUSES,
  currentMonthISO,
  normalizeStatus,
  statusMeta,
} from "./constants";
import StatusBadge from "./components/StatusBadge";
import AttendanceHistoryTable from "./components/AttendanceHistoryTable";
import { AttendanceStatCards } from "./components/AttendanceSummaryBar";
import { AttendanceFilterBar, FilterGroup } from "./components/AttendanceFilterBar";
import { LoadingState, ErrorState, EmptyState } from "./components/AttendanceStates";

const normalizeSummary = (data) => {
  const payload = data || {};
  const legacy = payload.legacySummary || null;
  const monthlyBlock = payload.monthly || {};
  const monthly =
    monthlyBlock.summary ||
    legacy?.summary ||
    legacy ||
    payload.summary ||
    monthlyBlock;
  const subjects = (payload.subjectWise || payload.subjects || []).map((s, i) => ({
    id: s.subjectId ?? i,
    name: s.subjectName || s.subject || `Subject ${i + 1}`,
    percentage: Number(s.percentage ?? s.pct ?? 0),
    present: s.present,
    total: s.total ?? s.classes,
  }));
  const history = (payload.history || payload.records || []).map((r, i) => ({
    id: r.id ?? `${r.date}-${i}`,
    name: "",
    subLabel: "",
    date: r.date || r.attendanceDate || "-",
    extra: {
      subject: r.subjectName || r.subject || "Daily",
      period: r.periodName || r.period || "-",
    },
    status: normalizeStatus(r.status),
    remarks: r.remarks || "",
    canEdit: false,
  }));
  const today = payload.today || null;
  return { monthly, subjects, history, today };
};

const pctColor = (pct) => (pct >= 75 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444");

/**
 * Student self-service attendance page (read-only).
 * Uses the JWT-scoped my-summary endpoint - never shows class/section selectors.
 */
const StudentMyAttendance = () => {
  const token = getToken();
  const [month, setMonth] = useState(currentMonthISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    await runApi(
      () => getMyAttendanceSummaryV2({ month }, token),
      {
        onSuccess: (res) => setData(normalizeSummary(res.data)),
        onError: () => {
          setData(null);
          setError("Could not load your attendance summary.");
        },
      }
    );
    setLoading(false);
  }, [token, month]);

  useEffect(() => {
    load();
  }, [load]);

  const monthly = data?.monthly || {};
  const workingDays =
    monthly.workingDays ??
    monthly.WorkingDays ??
    monthly.daysMarked ??
    monthly.totalDays ??
    0;
  const percentage = Number(monthly.percentage ?? 0);

  const statItems = [
    { label: "Working Days", value: workingDays, color: "#2d3a8c", bg: "#eef0fb", icon: "bx bx-calendar" },
    ...STUDENT_STATUSES.map((s) => {
      const meta = statusMeta(s);
      const legacyKey = s === STATUS.PRESENT ? "prestent" : undefined;
      return {
        label: s,
        value: monthly[meta.key] ?? (legacyKey ? monthly[legacyKey] : undefined) ?? 0,
        color: meta.color,
        bg: meta.bg,
        icon: meta.icon,
      };
    }),
    { label: "Attendance %", value: `${percentage}%`, color: pctColor(percentage), bg: "#fef3c7", icon: "bx bx-line-chart" },
  ];

  const todayStatus = data?.today?.status ?? data?.today;

  return (
    <div className="av2-wrap">
      <div className="av2-header">
        <div>
          {/* <h2 className="av2-title">My Attendance</h2> */}
          {/* <p className="av2-sub">Your personal attendance overview - read only</p> */}
        </div>
        {todayStatus ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="av2-muted">Today:</span>
            <StatusBadge status={normalizeStatus(todayStatus)} />
          </div>
        ) : null}
      </div>

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

      {loading ? (
        <div className="av2-panel"><LoadingState text="Loading your attendance…" /></div>
      ) : error ? (
        <div className="av2-panel"><ErrorState text={error} onRetry={load} /></div>
      ) : (
        <>
          <AttendanceStatCards items={statItems} />

          <div className="av2-two-col">
            <div className="av2-panel">
              <h3><i className="bx bx-book" style={{ color: "#2d3a8c" }}></i>Subject-wise Attendance</h3>
              {(data?.subjects || []).length === 0 ? (
                <EmptyState text="No subject-wise data available" icon="bx bx-book-open" />
              ) : (
                data.subjects.map((s) => (
                  <div className="av2-subject-row" key={s.id}>
                    <span className="av2-subject-name">{s.name}</span>
                    <div className="av2-progress-bar">
                      <div
                        className="av2-progress-fill"
                        style={{ width: `${Math.min(100, s.percentage)}%`, background: pctColor(s.percentage) }}
                      ></div>
                    </div>
                    <span className="av2-subject-pct" style={{ color: pctColor(s.percentage) }}>
                      {s.percentage}%
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="av2-panel" style={{ padding: 0, overflow: "hidden" }}>
              <h3 style={{ padding: "16px 18px 0" }}>
                <i className="bx bx-history" style={{ color: "#2d3a8c" }}></i>Recent History
              </h3>
              <AttendanceHistoryTable
                rows={data?.history || []}
                columns={[
                  { key: "subject", header: "Subject" },
                  { key: "period", header: "Period" },
                ]}
                emptyText="No attendance history for this month"
                showName={false}
                searchPlaceholder="Search history…"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentMyAttendance;
