import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";
import "../../assets/illustrations/schoolTheme.css";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";
import { getUserData, getToken } from "../../services/auth";
import {
  getAdminDashboardSummary,
  getEventSummary,
  getStudentlist,
  getStafflist,
  getAttendanceReportV2,
  getTransportFeeSummary,
  getFeesDashboardSummary,
} from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const P = "#2D3A8C";
const O = "#E8541A";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const asRowList = (value) => {
  let list = Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
  while (list.length === 1 && Array.isArray(list[0])) list = list[0];
  return list.filter((row) => row && typeof row === "object" && !Array.isArray(row));
};

const countStatus = (rows, matchers) =>
  rows.filter((r) => matchers.includes(String(r.status || "").toLowerCase())).length;

const summarizeDailyRows = (res) => {
  const rows = asRowList(res);
  const summaryBlock = res?.summary || {};
  const present =
    summaryBlock.present != null
      ? Number(summaryBlock.present)
      : countStatus(rows, ["present", "late", "half day"]);
  const absent =
    summaryBlock.absent != null
      ? Number(summaryBlock.absent)
      : countStatus(rows, ["absent"]);
  const leave = countStatus(rows, ["leave", "medical leave"]);
  const total =
    summaryBlock.total != null
      ? Number(summaryBlock.total)
      : rows.length || present + absent + leave;
  const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : null;
  return { present, absent, leave, total, rate };
};

/** Last 7 calendar days → chart points from daily attendance API. */
const buildWeeklyAttendance = async (token) => {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const results = await Promise.all(
    days.map((d) =>
      getAttendanceReportV2(
        "daily",
        { date: toISODate(d), classId: "All", sectionId: "All" },
        token
      ).catch(() => null)
    )
  );
  return days.map((d, idx) => {
    const res = results[idx];
    const ok = res && ["success", "Success"].includes(res.status);
    const stats = ok ? summarizeDailyRows(res) : { present: 0, absent: 0 };
    return {
      day: DAY_SHORT[d.getDay()],
      Present: stats.present || 0,
      Absent: stats.absent || 0,
      date: toISODate(d),
    };
  });
};

/** Last 6 months attendance % from class-wise report. */
const buildAttendanceTrend = async (token) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    months.push({
      month: MONTH_SHORT[start.getMonth()],
      startDate: toISODate(start),
      endDate: toISODate(end),
    });
  }
  const results = await Promise.all(
    months.map((m) =>
      getAttendanceReportV2(
        "class",
        { startDate: m.startDate, endDate: m.endDate, classId: "All", sectionId: "All" },
        token
      ).catch(() => null)
    )
  );
  return months.map((m, idx) => {
    const res = results[idx];
    const ok = res && ["success", "Success"].includes(res.status);
    let pct = ok ? Number(res?.summary?.averagePercentage) : 0;
    if (!pct && ok) {
      const rows = asRowList(res);
      if (rows.length) {
        const sum = rows.reduce((s, r) => s + Number(r.percentage || 0), 0);
        pct = Math.round((sum / rows.length) * 10) / 10;
      }
    }
    return { month: m.month, pct: Number.isFinite(pct) ? pct : 0 };
  });
};

const STAT_META = [
  { key: "students", label: "Total Students", icon: "bx bxs-group", color: "#2D3A8C", bg: "#eef0fb", fallbackSub: "Active students" },
  { key: "staff", label: "Total Teachers", icon: "bx bxs-user-badge", color: "#0891b2", bg: "#e0f7fa", fallbackSub: "Active staff" },
  { key: "attendance", label: "Attendance Today", icon: "bx bxs-calendar-check", color: "#16a34a", bg: "#dcfce7", fallbackSub: "No attendance marked" },
  { key: "feesCollected", label: "Fees Collected", icon: "bx bxs-wallet-alt", color: "#d97706", bg: "#fef3c7", fallbackSub: "Transport fees" },
  { key: "feesPending", label: "Pending Fees", icon: "bx bxs-error-circle", color: "#E8541A", bg: "#fdf0eb", fallbackSub: "Transport pending" },
  { key: "exams", label: "Upcoming Exams", icon: "bx bxs-notepad", color: "#7c3aed", bg: "#f5f3ff", fallbackSub: "Scheduled exams" },
  { key: "parents", label: "Total Parents", icon: "bx bxs-home-heart", color: "#0891b2", bg: "#e0f7fa", fallbackSub: "Registered contacts" },
  { key: "events", label: "Upcoming Events", icon: "bx bxs-calendar-event", color: "#E8541A", bg: "#fdf0eb", fallbackSub: "Published events" },
];

const EMPTY_WEEKLY = [
  { day: "Mon", Present: 0, Absent: 0 },
  { day: "Tue", Present: 0, Absent: 0 },
  { day: "Wed", Present: 0, Absent: 0 },
  { day: "Thu", Present: 0, Absent: 0 },
  { day: "Fri", Present: 0, Absent: 0 },
  { day: "Sat", Present: 0, Absent: 0 },
];

const quickActions = [
  { label: "Add Student", icon: "bx bxs-user-plus", color: "#2D3A8C", bg: "#eef0fb", path: "/admin/student/new", state: "Student Registration" },
  { label: "Add Staff", icon: "bx bxs-user-check", color: "#16a34a", bg: "#dcfce7", path: "/admin/staff/new", state: "Staff Registration" },
  { label: "Transport Fee", icon: "bx bx-rupee", color: "#E8541A", bg: "#fdf0eb", path: "/admin/transport" },
  { label: "Add Exam", icon: "bx bxs-notepad", color: "#7c3aed", bg: "#f5f3ff", path: "/admin/examportion" },
  { label: "Send Notice", icon: "bx bxs-send", color: "#0891b2", bg: "#e0f7fa", path: "/admin/events" },
  { label: "Generate Report", icon: "bx bxs-bar-chart-alt-2", color: "#d97706", bg: "#fef3c7", path: "/admin/reports" },
];

const fmtCount = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (v) => {
  const n = Number(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const TICK = { fontSize: 11, fill: "#6b7280", fontFamily: "Inter" };
const TT = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.09)", fontSize: 12 };

const AdminDashboard = () => {
  const [attView, setAttView] = useState("week");
  const [feeView, setFeeView] = useState("pie");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [eventSummary, setEventSummary] = useState(null);
  const navigate = useNavigate();
  const userName = getUserData("adminName") || getUserData("staffName") || "Admin";

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Live overlays from existing list/report APIs (win over get_summary zeros)
      let livePatch = {};
      const mergeSummary = (patch) => {
        livePatch = { ...livePatch, ...patch };
        if (cancelled) return;
        setSummary((prev) => ({ ...(prev || {}), ...livePatch }));
      };

      await Promise.all([
        runApi(() => getAdminDashboardSummary(token), {
          onSuccess: (res) => {
            if (cancelled) return;
            setSummary({ ...(res?.data || {}), ...livePatch });
          },
        }),
        runApi(() => getEventSummary(token), {
          onSuccess: (res) => {
            if (!cancelled) setEventSummary(res?.data || null);
          },
        }),
        // Existing registration API - active students (isActive = '1')
        runApi(
          () => getStudentlist({ userName: 0, classId: 0, sectionId: 0 }, token),
          {
            onSuccess: (res) => {
              const rows = asRowList(res);
              mergeSummary({ totalStudents: rows.length });
            },
          }
        ),
        // Existing staff list API - total teachers / staff
        runApi(() => getStafflist("0", token), {
          onSuccess: (res) => {
            const rows = asRowList(res);
            mergeSummary({ totalStaff: rows.length });
          },
        }),
        // Existing attendance report - school-wide today
        runApi(
          () =>
            getAttendanceReportV2(
              "daily",
              { date: todayISO(), classId: "All", sectionId: "All" },
              token
            ),
          {
            onSuccess: (res) => {
              mergeSummary({ attendanceToday: summarizeDailyRows(res) });
            },
          }
        ),
        // Combined school + transport fees → pie; fallback to transport-only
        (async () => {
          const applyFees = (d, source) => {
            const collected = Number(d.collected) || 0;
            const pending = Number(d.pending) || 0;
            const defaulters = Number(d.unpaidCount ?? d.defaulters) || 0;
            const monthLabel = MONTH_SHORT[new Date().getMonth()];
            const breakdown =
              Array.isArray(d.breakdown) && d.breakdown.length
                ? d.breakdown.map((b) => ({
                    name: b.name,
                    value: Number(b.value) || 0,
                    color: b.color || (b.name === "Pending" ? "#ef4444" : "#4F46E5"),
                  }))
                : [
                    { name: "Collected", value: collected, color: "#4F46E5" },
                    { name: "Pending", value: pending, color: "#ef4444" },
                  ];
            mergeSummary({
              fees: {
                collected,
                pending,
                defaulters,
                source,
                breakdown,
                monthly: [
                  {
                    month: monthLabel,
                    collected,
                    pending,
                  },
                ],
              },
            });
          };
          try {
            const res = await getFeesDashboardSummary(token);
            const d = res?.data || res || {};
            if (String(res?.status || "").toLowerCase() === "error") {
              throw new Error(res?.message || "fees summary failed");
            }
            applyFees(d, d.source || "school+transport");
          } catch (_) {
            await runApi(() => getTransportFeeSummary(token), {
              onSuccess: (res) => {
                const d = res?.data || res || {};
                applyFees(d, "transport");
              },
            });
          }
        })(),
        // Weekly + monthly attendance charts from report APIs
        (async () => {
          try {
            const [weekly, trend] = await Promise.all([
              buildWeeklyAttendance(token),
              buildAttendanceTrend(token),
            ]);
            mergeSummary({
              attendanceWeekly: weekly,
              attendanceTrend: trend,
            });
          } catch (_) {
            /* keep summary defaults */
          }
        })(),
      ]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const att = summary?.attendanceToday || {};
  const fees = summary?.fees || {};
  const attendanceData = summary?.attendanceWeekly?.length
    ? summary.attendanceWeekly
    : EMPTY_WEEKLY;
  const hasWeeklyAtt = attendanceData.some(
    (d) => Number(d.Present || 0) + Number(d.Absent || 0) > 0
  );
  const attendanceTrend = summary?.attendanceTrend?.length ? summary.attendanceTrend : [];
  const hasTrendAtt = attendanceTrend.some((d) => Number(d.pct || 0) > 0);
  const feeData = fees.breakdown?.length
    ? fees.breakdown
    : [
        { name: "Collected", value: Number(fees.collected) || 0, color: "#4F46E5" },
        { name: "Pending", value: Number(fees.pending) || 0, color: "#ef4444" },
      ];
  const feeMonthly = fees.monthly?.length
    ? fees.monthly
    : Number(fees.collected) || Number(fees.pending)
    ? [
        {
          month: MONTH_SHORT[new Date().getMonth()],
          collected: Number(fees.collected) || 0,
          pending: Number(fees.pending) || 0,
        },
      ]
    : [];
  const hasFeeData = feeData.some((d) => Number(d.value) > 0);
  const upcomingExams = summary?.upcomingExamList || [];
  const recentActivity = summary?.recentActivity || [];
  const classAttendance = summary?.classAttendance || [];

  const totalFee = feeData.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const collectedAmt = Number(fees.collected) || feeData.find((d) => d.name === "Collected")?.value || 0;
  const pendingAmt = Number(fees.pending) || feeData.find((d) => d.name === "Pending")?.value || 0;
  const collectionRate =
    collectedAmt + pendingAmt > 0
      ? Math.round((collectedAmt / (collectedAmt + pendingAmt)) * 100)
      : 0;

  const statCards = useMemo(() => {
    const rate = att.rate != null ? att.rate : null;
    const present = att.present != null ? att.present : null;
    const total = att.total != null ? att.total : summary?.totalStudents;
    const nextEvent = eventSummary?.upcomingEvents?.[0];

    const values = {
      students: {
        value: fmtCount(summary?.totalStudents ?? 0),
        sub: summary?.newAdmissionsThisMonth != null
          ? `↑ ${summary.newAdmissionsThisMonth} this month`
          : "Active students",
      },
      staff: {
        value: fmtCount(summary?.totalStaff ?? 0),
        sub: "Active staff",
      },
      attendance: {
        value: rate != null ? `${rate}%` : "-",
        sub:
          present != null && total != null
            ? `${fmtCount(present)} / ${fmtCount(total)} present`
            : "No attendance marked",
      },
      feesCollected: {
        value: fmtMoney(fees.collected ?? 0),
        sub:
          fees.source === "school+transport"
            ? "School + transport"
            : fees.source === "transport"
            ? "Transport fees"
            : "This month",
      },
      feesPending: {
        value: fmtMoney(fees.pending ?? 0),
        sub: fees.defaulters != null
          ? `${fmtCount(fees.defaulters)} students pending`
          : "Pending dues",
      },
      exams: {
        value: fmtCount(summary?.upcomingExams ?? upcomingExams.length ?? 0),
        sub: "Scheduled exams",
      },
      parents: {
        value: fmtCount(summary?.totalParents ?? 0),
        sub: "Registered contacts",
      },
      events: {
        value: fmtCount(
          eventSummary?.counts?.upcoming ??
            eventSummary?.upcomingEvents?.length ??
            0
        ),
        sub: nextEvent
          ? `Next: ${nextEvent.title} - ${String(nextEvent.eventDate || "").slice(0, 10)}`
          : `${eventSummary?.counts?.today || 0} today · ${eventSummary?.counts?.announcements || 0} announcements`,
      },
    };

    return STAT_META.map((m) => ({
      ...m,
      value: values[m.key]?.value ?? "0",
      sub: values[m.key]?.sub ?? m.fallbackSub,
    }));
  }, [summary, eventSummary, att, fees, upcomingExams.length]);

  const welcomeStudents = fmtCount(summary?.totalStudents ?? 0);
  const welcomeTeachers = fmtCount(summary?.totalStaff ?? 0);
  const welcomeAtt = att.rate != null ? `${att.rate}%` : "-";
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr = today.toLocaleDateString("en-IN", { weekday: "long" });
  const grades = summary?.totalClasses ?? 0;
  const sections = summary?.totalSections ?? 0;

  if (loading) {
    return (
      <div className="kst-dash" style={{ display: "grid", placeItems: "center", minHeight: 280 }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: P }} />
          <h3 style={{ marginTop: 12, color: P }}>Loading Dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="kst-dash">
      <div className="kst-welcome-banner">
        <div className="kst-welcome-text">
          <h2>Welcome back, {userName}!</h2>
          <p>Manage students, staff, exams &amp; fees - all in one place.</p>
          <div className="kst-welcome-tags">
            <span className="kst-welcome-tag"><i className="bx bxs-group"></i> {welcomeStudents} Students</span>
            <span className="kst-welcome-tag"><i className="bx bxs-chalkboard"></i> {welcomeTeachers} Teachers</span>
            <span className="kst-welcome-tag"><i className="bx bxs-calendar-check"></i> {welcomeAtt} Attendance</span>
          </div>
        </div>
        <StudentMascot className="kst-welcome-art" width={130} />
      </div>

      <div className="kst-r1">
        <div className="kst-stat-row5">
          {statCards.map((c, i) => (
            <div className="kst-stat-card" key={i}>
              <div className="kst-sc-icon" style={{ background: c.bg, color: c.color }}>
                <i className={c.icon}></i>
              </div>
              <div className="kst-sc-body">
                <div className="kst-stat-val">{c.value}</div>
                <div className="kst-stat-label">{c.label}</div>
                <div className="kst-stat-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="kst-date-widget">
          <div className="kst-date-top">
            <i className="bx bx-calendar" style={{ color: P, fontSize: 18 }}></i>
            <div>
              <div className="kst-date-val">{dateStr}</div>
              <div className="kst-date-day">{dayStr}</div>
            </div>
          </div>
          <div className="kst-date-divider"></div>
          <div className="kst-classes-block">
            <div className="kst-sc-icon" style={{ background: "#eef0fb", color: P }}>
              <i className="bx bxs-school"></i>
            </div>
            <div>
              <div className="kst-classes-val">{fmtCount(grades)}</div>
              <div className="kst-classes-label">Total Classes</div>
              <div className="kst-stat-sub">{grades} grades • {sections} sections</div>
            </div>
          </div>
        </div>
      </div>

      <div className="kst-chart-row">
        <div className="kst-card">
          <div className="kst-card-header">
            <div>
              <h3>Student Attendance</h3>
              <p className="kst-chart-sub">Weekly present vs absent</p>
            </div>
            <div className="kst-tabs">
              {["week", "trend"].map((v) => (
                <button
                  key={v}
                  className={`kst-tab${attView === v ? " active" : ""}`}
                  onClick={() => setAttView(v)}
                >
                  {v === "week" ? "This Week" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          {attView === "week" ? (
            hasWeeklyAtt ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#2D3A8C" />
                    </linearGradient>
                    <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={TICK} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK} allowDecimals={false} />
                  <Tooltip contentStyle={TT} cursor={{ fill: "rgba(79,70,229,.04)" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Present" fill="url(#gPresent)" radius={[8, 8, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Absent" fill="url(#gAbsent)" radius={[8, 8, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="kst-chart-sub" style={{ padding: "48px 16px", textAlign: "center" }}>
                No attendance marked in the last 7 days.
              </div>
            )
          ) : hasTrendAtt ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={P} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={P} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={TICK} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} formatter={(v) => `${v}%`} />
                <Area
                  type="monotone"
                  dataKey="pct"
                  name="Attendance %"
                  stroke={P}
                  strokeWidth={2.5}
                  fill="url(#gArea)"
                  dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="kst-chart-sub" style={{ padding: "48px 16px", textAlign: "center" }}>
              No monthly attendance data yet.
            </div>
          )}
          <div className="kst-att-stats">
            {[
              { label: "Present", val: fmtCount(att.present ?? 0), color: "#2D3A8C" },
              { label: "Absent", val: fmtCount(att.absent ?? 0), color: "#ef4444" },
              { label: "Leave", val: fmtCount(att.leave ?? 0), color: "#d97706" },
              { label: "Rate", val: att.rate != null ? `${att.rate}%` : "-", color: "#16a34a" },
            ].map((s, i) => (
              <div className="kst-att-stat" key={i}>
                <span className="kst-att-dot" style={{ background: s.color }}></span>
                <div>
                  <div className="kst-att-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="kst-att-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kst-card kst-fee-card">
          <div className="kst-card-header">
            <div>
              <h3>Fee Collection</h3>
              <p className="kst-chart-sub">
                Total: {fmtMoney(totalFee)} · {collectionRate}% collected · {fmtCount(fees.defaulters ?? 0)} defaulters
                {fees.source === "transport" ? " (Transport)" : ""}
              </p>
            </div>
            <div className="kst-tabs">
              {["pie", "bar"].map((v) => (
                <button
                  key={v}
                  className={`kst-tab${feeView === v ? " active" : ""}`}
                  onClick={() => setFeeView(v)}
                  disabled={v === "bar" && !feeMonthly.length}
                >
                  {v === "pie" ? "Breakdown" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          <div className="kst-fee-body">
            {!hasFeeData ? (
              <div className="kst-chart-sub" style={{ padding: "48px 16px", textAlign: "center", width: "100%" }}>
                No transport fee records yet. Add allocations under Transport.
              </div>
            ) : feeView === "pie" || !feeMonthly.length ? (
              <div className="kst-fee-wrap">
                <ResponsiveContainer width="48%" height={270}>
                  <PieChart>
                    <Pie
                      data={feeData.filter((d) => Number(d.value) > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {feeData
                        .filter((d) => Number(d.value) > 0)
                        .map((d, i) => (
                          <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={TT} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="kst-fee-legend">
                  {feeData.map((d, i) => (
                    <div className="kst-fee-leg-item" key={i}>
                      <span className="kst-legend-dot" style={{ background: d.color }}></span>
                      <span className="kst-fee-leg-name">{d.name}</span>
                      <div className="kst-fee-leg-right">
                        <span className="kst-fee-leg-val">{fmtMoney(d.value)}</span>
                        <span className="kst-fee-leg-pct" style={{ color: d.color }}>
                          ({totalFee ? Math.round((d.value / totalFee) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={feeMonthly} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtMoney} tick={{ ...TICK, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={fmtMoney} contentStyle={TT} />
                  <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="collected" name="Collected" fill="#4F46E5" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="kst-card kst-quick-card">
          <div className="kst-card-header">
            <h3><i className="bx bxs-zap" style={{ color: O, marginRight: 6 }}></i>Quick Actions</h3>
          </div>
          <div className="kst-qa-grid">
            {quickActions.map((a, i) => (
              <button
                key={i}
                className="kst-qa-btn"
                onClick={() =>
                  navigate(a.path, a.state != null ? { state: a.state } : undefined)
                }
              >
                <div className="kst-qa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={a.icon}></i>
                </div>
                <span className="kst-qa-label">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="kst-bot-row">
        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bxs-notepad" style={{ color: P, marginRight: 6 }}></i>Upcoming Exams</h3>
            <span className="kst-badge-pill">Next 2 weeks</span>
          </div>
          <div className="kst-exam-list">
            {upcomingExams.length ? upcomingExams.map((e, i) => (
              <div className="kst-exam-item" key={i}>
                <div className="kst-exam-date-box" style={{ background: e.color + "15", borderLeft: `3px solid ${e.color}` }}>
                  <span className="kst-exam-date" style={{ color: e.color }}>{e.date}</span>
                </div>
                <div className="kst-exam-info">
                  <span className="kst-exam-subject">{e.subject}</span>
                  <span className="kst-exam-cls">{e.cls}</span>
                </div>
                <span className="kst-exam-type" style={{ background: e.color + "15", color: e.color }}>{e.type}</span>
              </div>
            )) : (
              <div className="kst-chart-sub" style={{ padding: 16 }}>No upcoming exams scheduled.</div>
            )}
          </div>
          <button className="kst-view-all" onClick={() => navigate("/admin/examportion")}>
            View all exams <i className="bx bx-chevron-right"></i>
          </button>
        </div>

        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bx-pulse" style={{ color: P, marginRight: 6 }}></i>Recent Activity</h3>
            <span className="kst-badge-pill kst-badge-green">Live</span>
          </div>
          <ul className="kst-activity-list">
            {recentActivity.length ? recentActivity.map((a, i) => (
              <li key={i} className="kst-activity-item">
                <div className="kst-act-avatar" style={{ background: a.color }}>{a.avatar}</div>
                <div className="kst-act-info">
                  <span className="kst-act-name">{a.name}</span>
                  <span className="kst-act-action">{a.action}</span>
                </div>
                <span className="kst-act-time">{a.time}</span>
              </li>
            )) : (
              <li className="kst-chart-sub" style={{ padding: 16, listStyle: "none" }}>No recent activity.</li>
            )}
          </ul>
          <button className="kst-view-all" onClick={() => navigate("/admin/leave")}>
            View leave queue <i className="bx bx-chevron-right"></i>
          </button>
        </div>

        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bx-bar-chart" style={{ color: P, marginRight: 6 }}></i>Class-wise Attendance</h3>
            <span className="kst-badge-pill">Today</span>
          </div>
          <div className="kst-class-list">
            {classAttendance.length ? classAttendance.map((c, i) => (
              <div className="kst-class-item" key={i}>
                <div className="kst-class-name-wrap">
                  <span className="kst-class-name">{c.cls}</span>
                  <span className="kst-class-count">{c.present}/{c.total}</span>
                </div>
                <div className="kst-class-bar-wrap">
                  <div className="kst-class-bar">
                    <div className="kst-class-bar-fill" style={{ width: `${c.pct}%`, background: c.color }}></div>
                  </div>
                  <span className="kst-class-pct" style={{ color: c.color }}>{c.pct}%</span>
                </div>
              </div>
            )) : (
              <div className="kst-chart-sub" style={{ padding: 16 }}>No class attendance for today.</div>
            )}
          </div>
          <button className="kst-view-all" onClick={() => navigate("/admin/reports/attendance")}>
            View full report <i className="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
