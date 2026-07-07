import React, { useState, useEffect, useMemo } from "react";
import "./Dashboard.css";
import { getStaffDashboardSummary } from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const P = "#2D3A8C";
const TICK = { fontSize: 11, fill: "#6b7280", fontFamily: "Poppins" };
const TT   = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.09)", fontSize: 12 };

const weeklyAttendance = [
  { day: "Mon", Present: 42, Absent: 3 },
  { day: "Tue", Present: 40, Absent: 5 },
  { day: "Wed", Present: 44, Absent: 1 },
  { day: "Thu", Present: 41, Absent: 4 },
  { day: "Fri", Present: 43, Absent: 2 },
  { day: "Sat", Present: 38, Absent: 2 },
];

const attendanceTrend = [
  { month: "Jul", pct: 90 }, { month: "Aug", pct: 88 }, { month: "Sep", pct: 93 },
  { month: "Oct", pct: 95 }, { month: "Nov", pct: 91 }, { month: "Dec", pct: 94 },
];

const quickActions = [
  { label: "Mark Attendance", icon: "bx bx-calendar-check", color: "#2D3A8C", bg: "#eef0fb" },
  { label: "Add Homework",    icon: "bx bx-book",           color: "#d97706", bg: "#fef3c7" },
  { label: "Assignments",     icon: "bx bx-task",           color: "#16a34a", bg: "#dcfce7" },
  { label: "Marks Entry",     icon: "bx bx-edit",           color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Timetable",       icon: "bx bx-time",           color: "#0891b2", bg: "#e0f7fa" },
  { label: "Students",        icon: "bx bx-group",          color: "#E8541A", bg: "#fdf0eb" },
];

const upcomingTasks = [
  { title: "Review Mathematics Assignment", desc: "12 submissions waiting",  priority: "high",   icon: "bx bx-time-five"      },
  { title: "Upload Homework",               desc: "Class IX-B • Due Today",  priority: "medium", icon: "bx bx-book"           },
  { title: "Staff Meeting",                 desc: "3:30 PM • Conference Hall",priority: "low",   icon: "bx bx-calendar-event" },
  { title: "Publish Unit Test Marks",       desc: "Class X-A",               priority: "high",   icon: "bx bx-edit"           },
];

const classPerformance = [
  { cls: "Class X - A",   subject: "Mathematics", pct: 91, color: "#2D3A8C" },
  { cls: "Class IX - B",  subject: "Mathematics", pct: 84, color: "#0891b2" },
  { cls: "Class VIII - C",subject: "Mathematics", pct: 72, color: "#E8541A" },
];

const recentActivity = [
  { avatar: "AT", label: "Attendance Marked",    desc: "Class X-A • 42 present",       time: "Today",     color: "#16a34a" },
  { avatar: "HW", label: "Homework Assigned",    desc: "Mathematics - Chapter 6",       time: "Today",     color: "#2D3A8C" },
  { avatar: "AS", label: "Assignment Reviewed",  desc: "25 submissions checked",        time: "1 hr ago",  color: "#d97706" },
  { avatar: "EX", label: "Exam Marks Published", desc: "Unit Test - Class X-A",         time: "Yesterday", color: "#7c3aed" },
  { avatar: "EV", label: "Event Reminder",       desc: "Parent Teacher Meeting - Mon",  time: "Yesterday", color: "#E8541A" },
];

const PRIORITY_COLOR = { high: "#ef4444", medium: "#d97706", low: "#16a34a" };
const PRIORITY_BG    = { high: "#fee2e2", medium: "#fef3c7", low: "#dcfce7" };

const StaffDashboard = () => {
  const token       = getToken();
  const staffName   = getUserData("staffName")      || getUserData("employeeName") || "Staff";
  const staffCode   = getUserData("staffCode")      || getUserData("employeeCode") || "EMP001";
  const designation = getUserData("designation")    || "Teacher";
  const department  = getUserData("departmentName") || "Department";

  const [loading, setLoading]   = useState(true);
  const [attView, setAttView]   = useState("week");
  const [dashboard, setDashboard] = useState({
    assignedClasses: 0, students: 0, attendance: 0,
    homework: 0, assignments: 0, leaves: 0, events: 0, notices: 0,
  });

  const today   = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr  = today.toLocaleDateString("en-IN", { weekday: "long" });
  const greeting = () => {
    const h = today.getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  useEffect(() => { if (token) loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await runApi(() => getStaffDashboardSummary(token), {
        onSuccess: (res) => {
          const d = res?.data || {};
          setDashboard({
            assignedClasses: d.assignedClasses  || 0,
            students:        d.totalStudents    || 0,
            attendance:      d.todayAttendance  || 0,
            homework:        d.homeworkCount    || 0,
            assignments:     d.assignmentCount  || 0,
            leaves:          d.totalLeaves      || 0,
            events:          d.upcomingEvents   || 0,
            notices:         d.notices          || 0,
          });
        },
      });
    } finally { setLoading(false); }
  };

  const statCards = useMemo(() => [
    { label: "Today's Classes",  value: dashboard.assignedClasses, sub: "Scheduled today",    icon: "bx bxs-school",          color: "#2D3A8C", bg: "#eef0fb" },
    { label: "Students",         value: dashboard.students,        sub: "Assigned students",  icon: "bx bxs-graduation",      color: "#16a34a", bg: "#dcfce7" },
    { label: "Attendance",       value: `${dashboard.attendance}%`,sub: "Today's rate",       icon: "bx bxs-calendar-check",  color: "#d97706", bg: "#fef3c7" },
    { label: "Homework",         value: dashboard.homework,        sub: "Active tasks",       icon: "bx bxs-book",            color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Assignments",      value: dashboard.assignments,     sub: "Pending review",     icon: "bx bx-task",             color: "#0891b2", bg: "#e0f7fa" },
    { label: "Leave Balance",    value: dashboard.leaves,          sub: "Days remaining",     icon: "bx bxs-plane-alt",       color: "#E8541A", bg: "#fdf0eb" },
  ], [dashboard]);

  if (loading) {
    return (
      <div className="sfd-loading">
        <div className="sfd-spinner"></div>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="sfd-dash">

      {/* ── Welcome Banner ── */}
      <div className="sfd-welcome-banner">
        <div className="sfd-welcome-text">
          <h2>{greeting()}, {staffName}! 👋</h2>
          <p>Manage your classes, attendance, homework and assignments — all in one place.</p>
          <div className="sfd-welcome-tags">
            <span className="sfd-welcome-tag"><i className="bx bx-id-card"></i> {staffCode}</span>
            <span className="sfd-welcome-tag"><i className="bx bx-briefcase"></i> {designation}</span>
            <span className="sfd-welcome-tag"><i className="bx bx-buildings"></i> {department}</span>
          </div>
        </div>
        <StudentMascot className="sfd-welcome-art" width={120} />
      </div>

      {/* ── Stat Cards ── */}
      <div className="sfd-stat-row">
        {statCards.map((c, i) => (
          <div className="sfd-stat-card" key={i}>
            <div className="sfd-sc-icon" style={{ background: c.bg, color: c.color }}>
              <i className={c.icon}></i>
            </div>
            <div className="sfd-sc-body">
              <div className="sfd-stat-val">{c.value}</div>
              <div className="sfd-stat-label">{c.label}</div>
              <div className="sfd-stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}

        {/* Date widget */}
        <div className="sfd-date-widget">
          <div className="sfd-date-top">
            <i className="bx bx-calendar" style={{ color: P, fontSize: 18 }}></i>
            <div>
              <div className="sfd-date-val">{dateStr}</div>
              <div className="sfd-date-day">{dayStr}</div>
            </div>
          </div>
          <div className="sfd-date-divider"></div>
          <div className="sfd-classes-block">
            <div className="sfd-sc-icon" style={{ background: "#eef0fb", color: P }}>
              <i className="bx bxs-school"></i>
            </div>
            <div>
              <div className="sfd-classes-val">{dashboard.assignedClasses}</div>
              <div className="sfd-classes-label">Classes Today</div>
              <div className="sfd-stat-sub">{dashboard.students} students</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Attendance Chart + Quick Actions ── */}
      <div className="sfd-chart-row">

        {/* Attendance Chart */}
        <div className="sfd-card">
          <div className="sfd-card-header">
            <div>
              <h3><i className="bx bx-calendar-check" style={{ color: P, marginRight: 6 }}></i>Student Attendance</h3>
              <p className="sfd-chart-sub">Weekly present vs absent</p>
            </div>
            <div className="sfd-tabs">
              {[["week", "This Week"], ["trend", "Monthly"]].map(([v, l]) => (
                <button key={v} className={`sfd-tab${attView === v ? " active" : ""}`} onClick={() => setAttView(v)}>{l}</button>
              ))}
            </div>
          </div>

          {attView === "week" ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={weeklyAttendance} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="sfdPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#2D3A8C" />
                  </linearGradient>
                  <linearGradient id="sfdAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={TICK} />
                <YAxis axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} cursor={{ fill: "rgba(79,70,229,.04)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" fill="url(#sfdPresent)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Absent"  fill="url(#sfdAbsent)"  radius={[8, 8, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sfdArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={P} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={P} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={TICK} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} formatter={v => `${v}%`} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke={P} strokeWidth={2.5}
                  fill="url(#sfdArea)" dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="sfd-att-stats">
            {[
              { label: "Present", val: "42",  color: "#2D3A8C" },
              { label: "Absent",  val: "3",   color: "#ef4444" },
              { label: "Late",    val: "1",   color: "#d97706" },
              { label: "Rate",    val: `${dashboard.attendance}%`, color: "#16a34a" },
            ].map((s, i) => (
              <div className="sfd-att-stat" key={i}>
                <span className="sfd-att-dot" style={{ background: s.color }}></span>
                <div>
                  <div className="sfd-att-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="sfd-att-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sfd-card sfd-quick-card">
          <div className="sfd-card-header">
            <h3><i className="bx bxs-zap" style={{ color: "#E8541A", marginRight: 6 }}></i>Quick Actions</h3>
          </div>
          <div className="sfd-qa-grid">
            {quickActions.map((a, i) => (
              <button key={i} className="sfd-qa-btn">
                <div className="sfd-qa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={a.icon}></i>
                </div>
                <span className="sfd-qa-label">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Tasks + Class Performance + Activity ── */}
      <div className="sfd-bot-row">

        {/* Pending Tasks */}
        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3><i className="bx bx-list-check" style={{ color: P, marginRight: 6 }}></i>Pending Tasks</h3>
            <span className="sfd-badge-pill">{upcomingTasks.length} tasks</span>
          </div>
          <div className="sfd-task-list">
            {upcomingTasks.map((t, i) => (
              <div className="sfd-task-item" key={i}>
                <div className="sfd-task-icon" style={{ background: PRIORITY_BG[t.priority], color: PRIORITY_COLOR[t.priority] }}>
                  <i className={t.icon}></i>
                </div>
                <div className="sfd-task-info">
                  <span className="sfd-task-title">{t.title}</span>
                  <span className="sfd-task-desc">{t.desc}</span>
                </div>
                <span className="sfd-priority-badge" style={{ background: PRIORITY_BG[t.priority], color: PRIORITY_COLOR[t.priority] }}>
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <button className="sfd-view-all">Manage tasks <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Class Performance */}
        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3><i className="bx bx-bar-chart" style={{ color: P, marginRight: 6 }}></i>Class Performance</h3>
            <span className="sfd-badge-pill">This term</span>
          </div>
          <div className="sfd-class-list">
            {classPerformance.map((c, i) => (
              <div className="sfd-class-item" key={i}>
                <div className="sfd-class-name-wrap">
                  <span className="sfd-class-name">{c.cls}</span>
                  <span className="sfd-class-sub">{c.subject}</span>
                </div>
                <div className="sfd-class-bar-wrap">
                  <div className="sfd-class-bar">
                    <div className="sfd-class-bar-fill" style={{ width: `${c.pct}%`, background: c.color }}></div>
                  </div>
                  <span className="sfd-class-pct" style={{ color: c.color }}>{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="sfd-perf-footer">
            {[
              { label: "Overall Avg", val: "82%", color: "#2D3A8C" },
              { label: "Best Class",  val: "91%", color: "#16a34a" },
              { label: "Needs Work",  val: "72%", color: "#E8541A" },
            ].map((p, i) => (
              <div className="sfd-perf-box" key={i}>
                <div className="sfd-perf-val" style={{ color: p.color }}>{p.val}</div>
                <div className="sfd-perf-label">{p.label}</div>
              </div>
            ))}
          </div>
          <button className="sfd-view-all">View full report <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Recent Activity */}
        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3><i className="bx bx-pulse" style={{ color: P, marginRight: 6 }}></i>Recent Activity</h3>
            <span className="sfd-badge-pill sfd-badge-green">Today</span>
          </div>
          <ul className="sfd-activity-list">
            {recentActivity.map((a, i) => (
              <li key={i} className="sfd-activity-item">
                <div className="sfd-act-avatar" style={{ background: a.color }}>{a.avatar}</div>
                <div className="sfd-act-info">
                  <span className="sfd-act-name">{a.label}</span>
                  <span className="sfd-act-action">{a.desc}</span>
                </div>
                <span className="sfd-act-time">{a.time}</span>
              </li>
            ))}
          </ul>
          <button className="sfd-view-all">View all activity <i className="bx bx-chevron-right"></i></button>
        </div>
      </div>

      {/* ── Productivity Banner ── */}
      <div className="sfd-card sfd-productivity">
        <div className="sfd-prod-header">
          <div>
            <h3><i className="bx bx-medal" style={{ marginRight: 8 }}></i>Today's Productivity</h3>
            <p>Your teaching performance today</p>
          </div>
        </div>
        <div className="sfd-prod-grid">
          {[
            { val: "6",  label: "Classes Completed"  },
            { val: "42", label: "Attendance Marked"  },
            { val: "25", label: "Assignments Reviewed"},
            { val: "18", label: "Homework Checked"   },
          ].map((p, i) => (
            <div className="sfd-prod-box" key={i}>
              <div className="sfd-prod-val">{p.val}</div>
              <div className="sfd-prod-label">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default StaffDashboard;
