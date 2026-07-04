import React, { useState, useEffect, useMemo } from "react";
import "./AdminDashboard.css";
import "../../assets/illustrations/schoolTheme.css";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";
import { getUserData, getToken } from "../../services/auth";
import { getAdminDashboardSummary } from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const P = "#2D3A8C";
const O = "#E8541A";

const DEFAULT_STAT_CARDS = [
  { label: "Total Students", value: "1,240", sub: "↑ 24 this month", icon: "bx bxs-group", color: "#2D3A8C", bg: "#eef0fb" },
  { label: "Total Teachers", value: "86", sub: "Active staff", icon: "bx bxs-user-badge", color: "#0891b2", bg: "#e0f7fa" },
  { label: "Attendance Today", value: "94.6%", sub: "1,176 / 1,240 present", icon: "bx bxs-calendar-check", color: "#16a34a", bg: "#dcfce7" },
  { label: "Fees Collected", value: "₹4,82,000", sub: "This month", icon: "bx bxs-wallet-alt", color: "#d97706", bg: "#fef3c7" },
  { label: "Pending Fees", value: "₹68,500", sub: "42 students pending", icon: "bx bxs-error-circle", color: "#E8541A", bg: "#fdf0eb" },
  { label: "Upcoming Exams", value: "6", sub: "Scheduled exams", icon: "bx bxs-notepad", color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Total Parents", value: "980", sub: "↑ 8 registered", icon: "bx bxs-home-heart", color: "#0891b2", bg: "#e0f7fa" },
  { label: "Upcoming Events", value: "988", sub: "Next: Math - Dec 20", icon: "bx bxs-calendar-event", color: "#E8541A", bg: "#fdf0eb" },
];

const fmtCount = (n) => (n == null ? null : Number(n).toLocaleString("en-IN"));

const row2Cards = [

];

const dateCard = {
  date: "May 20, 2025",
  day: "Tuesday",
  classes: "32",
  classSub: "8 grades • 4 sections",
};

const attendanceData = [
  { day: "Mon", Present: 1180, Absent: 60 },
  { day: "Tue", Present: 1160, Absent: 80 },
  { day: "Wed", Present: 1200, Absent: 40 },
  { day: "Thu", Present: 1140, Absent: 100 },
  { day: "Fri", Present: 1174, Absent: 66 },
  { day: "Sat", Present: 900, Absent: 30 },
];

const attendanceTrend = [
  { month: "Jul", pct: 91 }, { month: "Aug", pct: 88 }, { month: "Sep", pct: 93 },
  { month: "Oct", pct: 95 }, { month: "Nov", pct: 92 }, { month: "Dec", pct: 94 },
];

const feeData = [
  { name: "Collected", value: 482000, color: "#4F46E5" },
  { name: "Pending", value: 68500, color: "#ef4444" },
  { name: "Concession", value: 45000, color: "#f59e0b" },
  { name: "Scholarship", value: 25000, color: "#8b5cf6" },
  { name: "Waived", value: 15000, color: "#22c55e" },
];

const feeMonthly = [
  { month: "Jul", collected: 320000, pending: 45000 },
  { month: "Aug", collected: 410000, pending: 52000 },
  { month: "Sep", collected: 390000, pending: 38000 },
  { month: "Oct", collected: 450000, pending: 60000 },
  { month: "Nov", collected: 470000, pending: 55000 },
  { month: "Dec", collected: 482000, pending: 68500 },
];

const quickActions = [
  { label: "Add Student", icon: "bx bxs-user-plus", color: "#2D3A8C", bg: "#eef0fb", path: "/studentlist/new" },
  { label: "Add Staff", icon: "bx bxs-user-check", color: "#16a34a", bg: "#dcfce7", path: "/stafflist/new" },
  { label: "Collect Fee", icon: "bx bx-rupee", color: "#E8541A", bg: "#fdf0eb", path: "/" },
  { label: "Create Exam", icon: "bx bxs-notepad", color: "#7c3aed", bg: "#f5f3ff", path: "/exam" },
  { label: "Send Notice", icon: "bx bxs-send", color: "#0891b2", bg: "#e0f7fa", path: "/" },
  { label: "Generate Report", icon: "bx bxs-bar-chart-alt-2", color: "#d97706", bg: "#fef3c7", path: "/" },
];

const upcomingExams = [
  { subject: "Mathematics", cls: "Class 10", date: "Dec 20", type: "Final", color: "#2D3A8C" },
  { subject: "Science", cls: "Class 9", date: "Dec 22", type: "Unit", color: "#16a34a" },
  { subject: "English", cls: "Class 8", date: "Dec 24", type: "Mid-term", color: "#0891b2" },
  { subject: "Social Studies", cls: "Class 7", date: "Dec 26", type: "Unit", color: "#E8541A" },
  { subject: "Hindi", cls: "Class 10", date: "Dec 28", type: "Final", color: "#d97706" },
];

const recentActivity = [
  { avatar: "AA", name: "Aarav Sharma", action: "Enrolled in Class 10A", time: "10 min ago", color: "#2D3A8C" },
  { avatar: "PN", name: "Priya Nair", action: "Fee payment received", time: "30 min ago", color: "#16a34a" },
  { avatar: "MK", name: "Mr. Karthik", action: "Uploaded timetable", time: "1 hr ago", color: "#0891b2" },
  { avatar: "SV", name: "Sneha Verma", action: "Attendance marked - 9B", time: "2 hrs ago", color: "#7c3aed" },
  { avatar: "RG", name: "Rahul Gupta", action: "Exam result published", time: "Yesterday", color: "#d97706" },
];

const classAttendance = [
  { cls: "Class 10", present: 118, total: 120, pct: 98, color: "#2D3A8C" },
  { cls: "Class 9", present: 112, total: 120, pct: 93, color: "#0891b2" },
  { cls: "Class 8", present: 104, total: 115, pct: 90, color: "#16a34a" },
  { cls: "Class 7", present: 105, total: 110, pct: 95, color: "#E8541A" },
  { cls: "Class 6", present: 90, total: 108, pct: 83, color: "#d97706" },
  { cls: "Class 5", present: 85, total: 105, pct: 81, color: "#7c3aed" },
];

const notifications = [
  { icon: "bx bxs-error-circle", color: "#E8541A", bg: "#fdf0eb", val: "42", label: "Fee defaulters" },
  { icon: "bx bxs-notepad", color: "#d97706", bg: "#fef3c7", val: "6", label: "Exams this month" },
  { icon: "bx bxs-user-x", color: "#2D3A8C", bg: "#eef0fb", val: "3", label: "Staff on leave" },
  { icon: "bx bxs-user-plus", color: "#16a34a", bg: "#dcfce7", val: "18", label: "New admissions" },
  { icon: "bx bxs-bus", color: "#0891b2", bg: "#e0f7fa", val: "2", label: "Transport alerts" },
];

const fmt = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;

const TICK = { fontSize: 11, fill: "#6b7280", fontFamily: "Inter" };
const TT = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.09)", fontSize: 12 };

const AdminDashboard = () => {
  const [attView, setAttView] = useState("week");
  const [feeView, setFeeView] = useState("pie");
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const userName = getUserData("adminName") || getUserData("staffName") || "Admin";

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    runApi(() => getAdminDashboardSummary(token), {
      onSuccess: (res) => setSummary(res?.data || null),
    });
  }, []);

  const statCards = useMemo(() => {
    if (!summary) return DEFAULT_STAT_CARDS;
    return DEFAULT_STAT_CARDS.map((card) => {
      if (card.label === "Total Students" && summary.totalStudents != null) {
        const sub = summary.newAdmissionsThisMonth != null
          ? `↑ ${summary.newAdmissionsThisMonth} this month`
          : card.sub;
        return { ...card, value: fmtCount(summary.totalStudents), sub };
      }
      if (card.label === "Total Teachers" && summary.totalStaff != null) {
        return { ...card, value: fmtCount(summary.totalStaff) };
      }
      if (card.label === "Upcoming Exams" && summary.upcomingExams != null) {
        return { ...card, value: fmtCount(summary.upcomingExams) };
      }
      return card;
    });
  }, [summary]);

  const welcomeStudents = summary?.totalStudents != null ? fmtCount(summary.totalStudents) : "1,240";
  const welcomeTeachers = summary?.totalStaff != null ? fmtCount(summary.totalStaff) : "86";
  const totalFee = feeData.reduce((s, d) => s + d.value, 0);
  const collectedAmt = feeData.find((d) => d.name === "Collected")?.value || 0;
  const pendingAmt = feeData.find((d) => d.name === "Pending")?.value || 0;
  const collectionRate = Math.round((collectedAmt / (collectedAmt + pendingAmt)) * 100);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr = today.toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <div className="kst-dash">

      <div className="kst-welcome-banner">
        <div className="kst-welcome-text">
          <h2>Welcome back, {userName}!</h2>
          <p>Manage students, staff, exams &amp; fees - all in one place.</p>
          <div className="kst-welcome-tags">
            <span className="kst-welcome-tag"><i className="bx bxs-group"></i> {welcomeStudents} Students</span>
            <span className="kst-welcome-tag"><i className="bx bxs-chalkboard"></i> {welcomeTeachers} Teachers</span>
            <span className="kst-welcome-tag"><i className="bx bxs-calendar-check"></i> 94.6% Attendance</span>
          </div>
        </div>
        <StudentMascot className="kst-welcome-art" width={130} />
      </div>

      {/*  Row 1: 5 stat cards + date/classes widget  */}
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

        {/* Date + classes widget */}
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
              <div className="kst-classes-val">32</div>
              <div className="kst-classes-label">Total Classes</div>
              <div className="kst-stat-sub">8 grades • 4 sections</div>
            </div>
          </div>
        </div>
      </div>

      {/*  Row 2: 3 more stat cards  */}
      <div className="kst-stat-row3">
        {row2Cards.map((c, i) => (
          <div className="kst-stat-card kst-stat-card--wide" key={i}>
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

      {/*  Row 3: Attendance + Fee + Quick Actions  */}
      <div className="kst-chart-row">

        {/* Student Attendance */}
        <div className="kst-card">
          <div className="kst-card-header">
            <div>
              <h3>Student Attendance</h3>
              <p className="kst-chart-sub">Weekly present vs absent</p>
            </div>
            <div className="kst-tabs">
              {["week", "trend"].map(v => (
                <button key={v} className={`kst-tab${attView === v ? " active" : ""}`} onClick={() => setAttView(v)}>
                  {v === "week" ? "This Week" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          {attView === "week" ? (
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
                <YAxis axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} cursor={{ fill: "rgba(79,70,229,.04)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" fill="url(#gPresent)" radius={[8, 8, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Absent" fill="url(#gAbsent)" radius={[8, 8, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
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
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} formatter={v => `${v}%`} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke={P} strokeWidth={2.5}
                  fill="url(#gArea)" dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="kst-att-stats">
            {[
              { label: "Present", val: "1,174", color: "#2D3A8C" },
              { label: "Absent", val: "66", color: "#ef4444" },
              { label: "Leave", val: "12", color: "#d97706" },
              { label: "Rate", val: "94.6%", color: "#16a34a" },
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

        {/* Fee Collection */}
        <div className="kst-card kst-fee-card">
          <div className="kst-card-header">
            <div>
              <h3>Fee Collection</h3>
              <p className="kst-chart-sub">
                Total: {fmt(totalFee)} · {collectionRate}% collected · 42 defaulters
              </p>
            </div>
            <div className="kst-tabs">
              {["pie", "bar"].map(v => (
                <button key={v} className={`kst-tab${feeView === v ? " active" : ""}`} onClick={() => setFeeView(v)}>
                  {v === "pie" ? "Breakdown" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
          <div className="kst-fee-body">
            {feeView === "pie" ? (
              <div className="kst-fee-wrap">
                <ResponsiveContainer width="48%" height={270}>
                  <PieChart>
                    <Pie data={feeData} cx="50%" cy="50%" innerRadius={58} outerRadius={96}
                      paddingAngle={3} dataKey="value">
                      {feeData.map((d, i) => <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} contentStyle={TT} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="kst-fee-legend">
                  {feeData.map((d, i) => (
                    <div className="kst-fee-leg-item" key={i}>
                      <span className="kst-legend-dot" style={{ background: d.color }}></span>
                      <span className="kst-fee-leg-name">{d.name}</span>
                      <div className="kst-fee-leg-right">
                        <span className="kst-fee-leg-val">{fmt(d.value)}</span>
                        <span className="kst-fee-leg-pct" style={{ color: d.color }}>
                          ({Math.round((d.value / totalFee) * 100)}%)
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
                  <YAxis tickFormatter={fmt} tick={{ ...TICK, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={fmt} contentStyle={TT} />
                  <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="collected" name="Collected" fill="#4F46E5" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="kst-card kst-quick-card">
          <div className="kst-card-header">
            <h3><i className="bx bxs-zap" style={{ color: O, marginRight: 6 }}></i>Quick Actions</h3>
          </div>
          <div className="kst-qa-grid">
            {quickActions.map((a, i) => (
              <button key={i} className="kst-qa-btn" onClick={() => navigate(a.path)}>
                <div className="kst-qa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={a.icon}></i>
                </div>
                <span className="kst-qa-label">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/*  Row 4: Exams + Activity + Class Attendance  */}
      <div className="kst-bot-row">

        {/* Upcoming Exams */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bxs-notepad" style={{ color: P, marginRight: 6 }}></i>Upcoming Exams</h3>
            <span className="kst-badge-pill">Next 2 weeks</span>
          </div>
          <div className="kst-exam-list">
            {upcomingExams.map((e, i) => (
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
            ))}
          </div>
          <button className="kst-view-all">View all exams <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Recent Activity */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bx-pulse" style={{ color: P, marginRight: 6 }}></i>Recent Activity</h3>
            <span className="kst-badge-pill kst-badge-green">Today</span>
          </div>
          <ul className="kst-activity-list">
            {recentActivity.map((a, i) => (
              <li key={i} className="kst-activity-item">
                <div className="kst-act-avatar" style={{ background: a.color }}>{a.avatar}</div>
                <div className="kst-act-info">
                  <span className="kst-act-name">{a.name}</span>
                  <span className="kst-act-action">{a.action}</span>
                </div>
                <span className="kst-act-time">{a.time}</span>
              </li>
            ))}
          </ul>
          <button className="kst-view-all">View all activity <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Class-wise Attendance */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3><i className="bx bx-bar-chart" style={{ color: P, marginRight: 6 }}></i>Class-wise Attendance</h3>
            <span className="kst-badge-pill">Today</span>
          </div>
          <div className="kst-class-list">
            {classAttendance.map((c, i) => (
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
            ))}
          </div>
          <button className="kst-view-all">View full report <i className="bx bx-chevron-right"></i></button>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;
