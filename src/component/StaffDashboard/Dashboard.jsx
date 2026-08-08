import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { getStaffDashboardSummary, getEventSummary, getMyClassTeacherClassesV2 } from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

const P = "#2D3A8C";
const TICK = { fontSize: 11, fill: "#6b7280", fontFamily: "Poppins" };
const TT = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.09)", fontSize: 12 };

const EMPTY_WEEKLY = [
  { day: "Mon", Present: 0, Absent: 0 },
  { day: "Tue", Present: 0, Absent: 0 },
  { day: "Wed", Present: 0, Absent: 0 },
  { day: "Thu", Present: 0, Absent: 0 },
  { day: "Fri", Present: 0, Absent: 0 },
  { day: "Sat", Present: 0, Absent: 0 },
];

const quickActions = [
  { label: "Mark Attendance", icon: "bx bx-calendar-check", color: "#2D3A8C", bg: "#eef0fb", path: "/staff/attendance" },
  { label: "Add Homework", icon: "bx bx-book", color: "#d97706", bg: "#fef3c7", path: "/staff/homework" },
  { label: "Assignments", icon: "bx bx-task", color: "#16a34a", bg: "#dcfce7", path: "/staff/assignment" },
  { label: "Marks Entry", icon: "bx bx-edit", color: "#7c3aed", bg: "#f5f3ff", path: "/staff/examresult" },
  { label: "Timetable", icon: "bx bx-time", color: "#0891b2", bg: "#e0f7fa", path: "/staff/timetable" },
  { label: "Parent Meetings", icon: "bx bx-group", color: "#E8541A", bg: "#fdf0eb", path: "/staff/events" },
];

const PRIORITY_COLOR = { high: "#ef4444", medium: "#d97706", low: "#16a34a" };
const PRIORITY_BG = { high: "#fee2e2", medium: "#fef3c7", low: "#dcfce7" };

const formatClassTeacherLabel = (rows = []) =>
  rows
    .map((row) =>
      [row.className, row.sectionName].filter(Boolean).join(" · ")
    )
    .filter(Boolean)
    .join(", ");

const StaffDashboard = () => {
  const navigate = useNavigate();
  const token = getToken();
  const staffName = getUserData("staffName") || getUserData("employeeName") || "Staff";
  const staffCode = getUserData("userName") || getUserData("employeeCode") || "-";
  const designation = getUserData("designation") || "Teacher";
  const department = getUserData("departmentName") || "Department";

  const [loading, setLoading] = useState(true);
  const [classTeacherLabel, setClassTeacherLabel] = useState("");
  const [attView, setAttView] = useState("week");
  const [dashboard, setDashboard] = useState({
    assignedClasses: 0,
    totalAssignedClasses: 0,
    students: 0,
    attendance: 0,
    homework: 0,
    assignments: 0,
    leaves: 0,
    events: 0,
    parentMeetings: 0,
    attendanceToday: { present: 0, absent: 0, late: 0, rate: 0 },
    attendanceWeekly: EMPTY_WEEKLY,
    attendanceTrend: [],
    classPerformance: [],
    performanceSummary: { overallAvg: 0, bestClass: 0, needsWork: 0 },
    recentActivity: [],
    productivity: {
      classesCompleted: 0,
      attendanceMarked: 0,
      assignmentsReviewed: 0,
      homeworkChecked: 0,
    },
  });
  const [eventItems, setEventItems] = useState([]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr = today.toLocaleDateString("en-IN", { weekday: "long" });
  const greeting = () => {
    const h = today.getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([
        runApi(() => getStaffDashboardSummary(token), {
          onSuccess: (res) => {
            if (cancelled) return;
            const d = res?.data || {};
            const att = d.attendanceToday || {};
            setDashboard((prev) => ({
              ...prev,
              assignedClasses: d.assignedClasses || 0,
              totalAssignedClasses: d.totalAssignedClasses || d.assignedClasses || 0,
              students: d.totalStudents || 0,
              attendance: d.todayAttendance ?? att.rate ?? 0,
              homework: d.homeworkCount || 0,
              assignments: d.assignmentCount || 0,
              leaves: d.totalLeaves || 0,
              attendanceToday: {
                present: att.present || 0,
                absent: att.absent || 0,
                late: att.late || 0,
                rate: att.rate ?? d.todayAttendance ?? 0,
              },
              attendanceWeekly: d.attendanceWeekly?.length ? d.attendanceWeekly : EMPTY_WEEKLY,
              attendanceTrend: Array.isArray(d.attendanceTrend) ? d.attendanceTrend : [],
              classPerformance: Array.isArray(d.classPerformance) ? d.classPerformance : [],
              performanceSummary: d.performanceSummary || { overallAvg: 0, bestClass: 0, needsWork: 0 },
              recentActivity: Array.isArray(d.recentActivity) ? d.recentActivity : [],
              productivity: d.productivity || prev.productivity,
            }));
          },
        }),
        runApi(() => getEventSummary(token), {
          onSuccess: (res) => {
            if (cancelled) return;
            const d = res?.data || {};
            setDashboard((prev) => ({
              ...prev,
              events: d.counts?.upcoming || d.upcomingSchoolEvents?.length || 0,
              parentMeetings: d.counts?.created || d.parentMeetingsCreated?.length || 0,
            }));
            setEventItems([
              ...(d.upcomingSchoolEvents || []).slice(0, 3),
              ...(d.parentMeetingsCreated || []).slice(0, 3),
            ]);
          },
        }),
        runApi(() => getMyClassTeacherClassesV2(token), {
          onSuccess: (res) => {
            if (cancelled) return;
            setClassTeacherLabel(
              formatClassTeacherLabel(Array.isArray(res?.data) ? res.data : [])
            );
          },
          onError: () => {
            if (!cancelled) setClassTeacherLabel("");
          },
        }),
      ]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const weeklyAttendance = dashboard.attendanceWeekly?.length
    ? dashboard.attendanceWeekly
    : EMPTY_WEEKLY;
  const attendanceTrend = dashboard.attendanceTrend || [];
  const attToday = dashboard.attendanceToday || {};
  const perf = dashboard.performanceSummary || {};
  const productivity = dashboard.productivity || {};

  const statCards = useMemo(
    () => [
      {
        label: "Today's Classes",
        value: dashboard.assignedClasses,
        sub: `${dashboard.totalAssignedClasses} assigned overall`,
        icon: "bx bxs-school",
        color: "#2D3A8C",
        bg: "#eef0fb",
      },
      {
        label: "Students",
        value: dashboard.students,
        sub: "In your classes",
        icon: "bx bxs-graduation",
        color: "#16a34a",
        bg: "#dcfce7",
      },
      {
        label: "Attendance",
        value: `${dashboard.attendance}%`,
        sub: "Today's rate",
        icon: "bx bxs-calendar-check",
        color: "#d97706",
        bg: "#fef3c7",
      },
      {
        label: "Homework",
        value: dashboard.homework,
        sub: "Active tasks",
        icon: "bx bxs-book",
        color: "#7c3aed",
        bg: "#f5f3ff",
      },
      {
        label: "School Events",
        value: dashboard.events,
        sub: "Upcoming published",
        icon: "bx bxs-calendar-event",
        color: "#0891b2",
        bg: "#e0f7fa",
      },
      {
        label: "Parent Meetings",
        value: dashboard.parentMeetings,
        sub: "Created by you",
        icon: "bx bxs-group",
        color: "#E8541A",
        bg: "#fdf0eb",
      },
    ],
    [dashboard]
  );

  if (loading) {
    return (
      <div className="sfd-loading">
        <div className="sfd-spinner"></div>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  const eventTasks = eventItems.length
    ? eventItems.map((item) => ({
        title: item.title || "Event",
        desc: `${item.eventType || "Event"} · ${String(item.eventDate || "").slice(0, 10)}${
          item.eventTime ? ` · ${item.eventTime}` : ""
        }`,
        priority: String(item.priority || "medium").toLowerCase(),
        icon: "bx bx-calendar-event",
      }))
    : [];

  return (
    <div className="sfd-dash">
      <div className="sfd-welcome-banner">
        <div className="sfd-welcome-text">
          <h2>
            {greeting()}, {staffName}!
          </h2>
          <p>Manage your classes, attendance, homework and assignments - all in one place.</p>
          <div className="sfd-welcome-tags">
            <span className="sfd-welcome-tag">
              <i className="bx bx-id-card"></i> {staffCode}
            </span>
            <span className="sfd-welcome-tag">
              <i className="bx bx-briefcase"></i> {designation}
            </span>
            <span className="sfd-welcome-tag">
              <i className="bx bx-buildings"></i> {department}
            </span>
            {classTeacherLabel ? (
              <span className="sfd-welcome-tag sfd-welcome-tag-class">
                <i className="bx bx-group"></i> Class Teacher · {classTeacherLabel}
              </span>
            ) : null}
          </div>
        </div>
        <StudentMascot className="sfd-welcome-art" width={120} />
      </div>

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

      <div className="sfd-chart-row">
        <div className="sfd-card">
          <div className="sfd-card-header">
            <div>
              <h3>
                <i className="bx bx-calendar-check" style={{ color: P, marginRight: 6 }}></i>
                Student Attendance
              </h3>
              <p className="sfd-chart-sub">Your classes - present vs absent</p>
            </div>
            <div className="sfd-tabs">
              {[
                ["week", "This Week"],
                ["trend", "Monthly"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={`sfd-tab${attView === v ? " active" : ""}`}
                  onClick={() => setAttView(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {attView === "week" ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={weeklyAttendance} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <linearGradient id="sfdPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#2D3A8C" />
                  </linearGradient>
                  <linearGradient id="sfdAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={TICK} />
                <YAxis axisLine={false} tickLine={false} tick={TICK} />
                <Tooltip contentStyle={TT} cursor={{ fill: "rgba(79,70,229,.04)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Present" fill="url(#sfdPresent)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Absent" fill="url(#sfdAbsent)" radius={[8, 8, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : attendanceTrend.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sfdArea" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#sfdArea)"
                  dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="sfd-empty">No monthly attendance data yet</div>
          )}

          <div className="sfd-att-stats">
            {[
              { label: "Present", val: String(attToday.present || 0), color: "#2D3A8C" },
              { label: "Absent", val: String(attToday.absent || 0), color: "#ef4444" },
              { label: "Late", val: String(attToday.late || 0), color: "#d97706" },
              { label: "Rate", val: `${attToday.rate ?? dashboard.attendance}%`, color: "#16a34a" },
            ].map((s, i) => (
              <div className="sfd-att-stat" key={i}>
                <span className="sfd-att-dot" style={{ background: s.color }}></span>
                <div>
                  <div className="sfd-att-val" style={{ color: s.color }}>
                    {s.val}
                  </div>
                  <div className="sfd-att-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sfd-card sfd-quick-card">
          <div className="sfd-card-header">
            <h3>
              <i className="bx bxs-zap" style={{ color: "#E8541A", marginRight: 6 }}></i>
              Quick Actions
            </h3>
          </div>
          <div className="sfd-qa-grid">
            {quickActions.map((a, i) => (
              <button
                key={i}
                className="sfd-qa-btn"
                type="button"
                onClick={() => a.path && navigate(a.path)}
              >
                <div className="sfd-qa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={a.icon}></i>
                </div>
                <span className="sfd-qa-label">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sfd-bot-row">
        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3>
              <i className="bx bx-list-check" style={{ color: P, marginRight: 6 }}></i>
              Events & Meetings
            </h3>
            <span className="sfd-badge-pill">{eventTasks.length} items</span>
          </div>
          <div className="sfd-task-list">
            {eventTasks.length === 0 ? (
              <div className="sfd-empty">No upcoming events or meetings</div>
            ) : (
              eventTasks.map((t, i) => (
                <div className="sfd-task-item" key={i}>
                  <div
                    className="sfd-task-icon"
                    style={{ background: PRIORITY_BG[t.priority], color: PRIORITY_COLOR[t.priority] }}
                  >
                    <i className={t.icon}></i>
                  </div>
                  <div className="sfd-task-info">
                    <span className="sfd-task-title">{t.title}</span>
                    <span className="sfd-task-desc">{t.desc}</span>
                  </div>
                  <span
                    className="sfd-priority-badge"
                    style={{ background: PRIORITY_BG[t.priority], color: PRIORITY_COLOR[t.priority] }}
                  >
                    {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
          <button className="sfd-view-all" type="button" onClick={() => navigate("/staff/events")}>
            Manage events <i className="bx bx-chevron-right"></i>
          </button>
        </div>

        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3>
              <i className="bx bx-bar-chart" style={{ color: P, marginRight: 6 }}></i>
              Class Attendance
            </h3>
            <span className="sfd-badge-pill">Today</span>
          </div>
          <div className="sfd-class-list">
            {dashboard.classPerformance.length === 0 ? (
              <div className="sfd-empty">No class attendance marked today</div>
            ) : (
              dashboard.classPerformance.map((c, i) => (
                <div className="sfd-class-item" key={i}>
                  <div className="sfd-class-name-wrap">
                    <span className="sfd-class-name">{c.cls}</span>
                    <span className="sfd-class-sub">{c.subject}</span>
                  </div>
                  <div className="sfd-class-bar-wrap">
                    <div className="sfd-class-bar">
                      <div
                        className="sfd-class-bar-fill"
                        style={{ width: `${c.pct || 0}%`, background: c.color }}
                      ></div>
                    </div>
                    <span className="sfd-class-pct" style={{ color: c.color }}>
                      {c.pct || 0}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="sfd-perf-footer">
            {[
              { label: "Overall Avg", val: `${perf.overallAvg || 0}%`, color: "#2D3A8C" },
              { label: "Best Class", val: `${perf.bestClass || 0}%`, color: "#16a34a" },
              { label: "Needs Work", val: `${perf.needsWork || 0}%`, color: "#E8541A" },
            ].map((p, i) => (
              <div className="sfd-perf-box" key={i}>
                <div className="sfd-perf-val" style={{ color: p.color }}>
                  {p.val}
                </div>
                <div className="sfd-perf-label">{p.label}</div>
              </div>
            ))}
          </div>
          <button
            className="sfd-view-all"
            type="button"
            onClick={() => navigate("/staff/reports/attendance")}
          >
            View full report <i className="bx bx-chevron-right"></i>
          </button>
        </div>

        <div className="sfd-card">
          <div className="sfd-card-header">
            <h3>
              <i className="bx bx-pulse" style={{ color: P, marginRight: 6 }}></i>
              Recent Activity
            </h3>
            <span className="sfd-badge-pill sfd-badge-green">Live</span>
          </div>
          <ul className="sfd-activity-list">
            {dashboard.recentActivity.length === 0 ? (
              <li className="sfd-empty">No recent activity</li>
            ) : (
              dashboard.recentActivity.map((a, i) => (
                <li key={i} className="sfd-activity-item">
                  <div className="sfd-act-avatar" style={{ background: a.color }}>
                    {a.avatar}
                  </div>
                  <div className="sfd-act-info">
                    <span className="sfd-act-name">{a.label}</span>
                    <span className="sfd-act-action">{a.desc}</span>
                  </div>
                  <span className="sfd-act-time">{a.time}</span>
                </li>
              ))
            )}
          </ul>
          <button
            className="sfd-view-all"
            type="button"
            onClick={() => navigate("/staff/notifications")}
          >
            View all activity <i className="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="sfd-card sfd-productivity">
        <div className="sfd-prod-header">
          <div>
            <h3>
              <i className="bx bx-medal" style={{ marginRight: 8 }}></i>
              Today's Productivity
            </h3>
            <p>Your teaching activity today</p>
          </div>
        </div>
        <div className="sfd-prod-grid">
          {[
            { val: String(productivity.classesCompleted || 0), label: "Classes Scheduled" },
            { val: String(productivity.attendanceMarked || 0), label: "Attendance Marked" },
            { val: String(productivity.assignmentsReviewed || 0), label: "Assignments Created" },
            { val: String(productivity.homeworkChecked || 0), label: "Homework Created" },
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
