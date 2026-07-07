import React, { useEffect, useState, useMemo } from "react";
import "./StudentDashboard.css";
import { getHomework, getExam, getEvent, getViewAttendance } from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";
import {
  AreaChart, Area, ResponsiveContainer, CartesianGrid,
  XAxis, YAxis, Tooltip,
} from "recharts";

const P = "#2D3A8C";
const TICK = { fontSize: 11, fill: "#6b7280", fontFamily: "Poppins" };
const TT = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,.09)", fontSize: 12 };

const attendanceTrend = [
  { month: "Jul", pct: 88 }, { month: "Aug", pct: 91 }, { month: "Sep", pct: 85 },
  { month: "Oct", pct: 93 }, { month: "Nov", pct: 90 }, { month: "Dec", pct: 95 },
];

const quickActions = [
  { title: "Homework",   icon: "bx bx-book",           color: "#2563EB", bg: "#DBEAFE" },
  { title: "Attendance", icon: "bx bx-calendar-check", color: "#22C55E", bg: "#DCFCE7" },
  { title: "Exams",      icon: "bx bx-edit",           color: "#F97316", bg: "#FFEDD5" },
  { title: "Results",    icon: "bx bx-award",          color: "#7C3AED", bg: "#F5F3FF" },
  { title: "Timetable",  icon: "bx bx-time",           color: "#06B6D4", bg: "#CFFAFE" },
  { title: "Events",     icon: "bx bx-calendar-event", color: "#EC4899", bg: "#FCE7F3" },
  { title: "Fees",       icon: "bx bx-wallet",         color: "#059669", bg: "#D1FAE5" },
  { title: "Profile",    icon: "bx bx-user",           color: "#6366F1", bg: "#EEF2FF" },
];

const recentActivity = [
  { avatar: "HW", label: "Homework Assigned",      desc: "Mathematics - Chapter 6",    time: "Today",     color: "#2563EB" },
  { avatar: "AT", label: "Attendance Recorded",    desc: "Present today",              time: "Today",     color: "#22C55E" },
  { avatar: "EX", label: "Exam Schedule Released", desc: "Mid-term timetable updated", time: "Yesterday", color: "#F97316" },
  { avatar: "EV", label: "New Event Added",        desc: "Annual Sports Day",          time: "2 days ago",color: "#EC4899" },
];

const notices = [
  { icon: "bx bx-info-circle",  color: "#2563EB", bg: "#DBEAFE", title: "Parent Meeting",         desc: "Scheduled Saturday at 10:00 AM",          time: "2 hrs ago"  },
  { icon: "bx bx-book-open",    color: "#F97316", bg: "#FFEDD5", title: "Exam Schedule Published", desc: "Mid-term timetable has been released",     time: "Yesterday"  },
  { icon: "bx bx-trophy",       color: "#22C55E", bg: "#DCFCE7", title: "Sports Day",              desc: "Annual sports day registration is open",   time: "2 days ago" },
  { icon: "bx bx-party",        color: "#EC4899", bg: "#FCE7F3", title: "Science Exhibition",      desc: "Submit project ideas before next Friday",  time: "This week"  },
];

const StudentDashboard = () => {
  const token = getToken();
  const studentName = getUserData("studentName") || "Student";
  const admissionNo  = getUserData("admissionNo")  || "";
  const classId      = Number(getUserData("classId")   || 0);
  const sectionId    = Number(getUserData("sectionId") || 0);

  const [loading, setLoading]     = useState(true);
  const [homework, setHomework]   = useState([]);
  const [exams, setExams]         = useState([]);
  const [events, setEvents]       = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [dashboard, setDashboard] = useState({
    attendancePercent: 0, pendingHomework: 0, upcomingExams: 0, upcomingEvents: 0,
  });

  const today = new Date();
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
      await Promise.all([loadHomework(), loadExam(), loadEvents(), loadAttendance()]);
    } finally { setLoading(false); }
  };

  const loadHomework = async () => {
    await runApi(() => getHomework({ classId, sectionId, subjectId: 0 }, token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setHomework(list.slice(0, 4));
        setDashboard(p => ({ ...p, pendingHomework: list.length }));
      },
    });
  };

  const loadExam = async () => {
    await runApi(() => getExam({}, token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setExams(list.slice(0, 4));
        setDashboard(p => ({ ...p, upcomingExams: list.length }));
      },
    });
  };

  const loadEvents = async () => {
    await runApi(() => getEvent({ id: 0 }, token), {
      onSuccess: (res) => {
        const list = res.data || [];
        setEvents(list.slice(0, 4));
        setDashboard(p => ({ ...p, upcomingEvents: list.length }));
      },
    });
  };

  const loadAttendance = async () => {
    await runApi(
      () => getViewAttendance({ classId, sectionId, month: today.getMonth() + 1, year: today.getFullYear() }, token),
      {
        onSuccess: (res) => {
          const rows = res.data || [];
          const my = rows.find(x => x.admissionNo === admissionNo) || rows[0];
          setAttendance(my);
          if (my) {
            const pct = Math.round((my.presentDays / my.totalDays) * 100);
            setDashboard(p => ({ ...p, attendancePercent: pct }));
          }
        },
      }
    );
  };

  const statCards = useMemo(() => [
    { label: "Attendance",      value: `${dashboard.attendancePercent}%`, sub: "This month",       icon: "bx bxs-calendar-check", color: "#16a34a", bg: "#dcfce7" },
    { label: "Pending Homework",value: dashboard.pendingHomework,         sub: "Assigned tasks",   icon: "bx bxs-book",           color: "#d97706", bg: "#fef3c7" },
    { label: "Upcoming Exams",  value: dashboard.upcomingExams,           sub: "Scheduled exams",  icon: "bx bxs-edit",           color: "#2D3A8C", bg: "#eef0fb" },
    { label: "Upcoming Events", value: dashboard.upcomingEvents,          sub: "School events",    icon: "bx bxs-calendar-event", color: "#EC4899", bg: "#FCE7F3" },
  ], [dashboard]);

  if (loading) {
    return (
      <div className="std-loading">
        <div className="std-spinner"></div>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="std-dash">

      {/* ── Welcome Banner ── */}
      <div className="std-welcome-banner">
        <div className="std-welcome-text">
          <h2>{greeting()}, {studentName}! 👋</h2>
          <p>Track your attendance, homework, exams and events — all in one place.</p>
          <div className="std-welcome-tags">
            <span className="std-welcome-tag"><i className="bx bx-id-card"></i> {admissionNo || "Student"}</span>
            <span className="std-welcome-tag"><i className="bx bx-building"></i> Class {classId} – Sec {sectionId}</span>
            <span className="std-welcome-tag"><i className="bx bxs-calendar-check"></i> {dashboard.attendancePercent}% Attendance</span>
          </div>
        </div>
        <StudentMascot className="std-welcome-art" width={120} />
      </div>

      {/* ── Stat Cards ── */}
      <div className="std-stat-row">
        {statCards.map((c, i) => (
          <div className="std-stat-card" key={i}>
            <div className="std-sc-icon" style={{ background: c.bg, color: c.color }}>
              <i className={c.icon}></i>
            </div>
            <div className="std-sc-body">
              <div className="std-stat-val">{c.value}</div>
              <div className="std-stat-label">{c.label}</div>
              <div className="std-stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}

        {/* Date widget */}
        <div className="std-date-widget">
          <div className="std-date-top">
            <i className="bx bx-calendar" style={{ color: P, fontSize: 18 }}></i>
            <div>
              <div className="std-date-val">{dateStr}</div>
              <div className="std-date-day">{dayStr}</div>
            </div>
          </div>
          <div className="std-date-divider"></div>
          <div className="std-classes-block">
            <div className="std-sc-icon" style={{ background: "#eef0fb", color: P }}>
              <i className="bx bxs-graduation"></i>
            </div>
            <div>
              <div className="std-classes-val">Class {classId}</div>
              <div className="std-classes-label">Section {sectionId}</div>
              <div className="std-stat-sub">Admission: {admissionNo || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Attendance chart + Quick Actions ── */}
      <div className="std-chart-row">

        {/* Attendance Trend */}
        <div className="std-card">
          <div className="std-card-header">
            <div>
              <h3><i className="bx bx-line-chart" style={{ color: P, marginRight: 6 }}></i>Attendance Trend</h3>
              <p className="std-chart-sub">Monthly attendance percentage</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stdArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={P} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={P} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={TICK} />
              <YAxis domain={[75, 100]} axisLine={false} tickLine={false} tick={TICK} />
              <Tooltip contentStyle={TT} formatter={v => `${v}%`} />
              <Area type="monotone" dataKey="pct" name="Attendance %" stroke={P} strokeWidth={2.5}
                fill="url(#stdArea)" dot={{ r: 4, fill: P, stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="std-att-stats">
            {[
              { label: "Present",    val: attendance?.presentDays ?? "--", color: "#16a34a" },
              { label: "Absent",     val: attendance?.absentDays  ?? "--", color: "#ef4444" },
              { label: "Total Days", val: attendance?.totalDays   ?? "--", color: "#2D3A8C" },
              { label: "Rate",       val: `${dashboard.attendancePercent}%`, color: "#d97706" },
            ].map((s, i) => (
              <div className="std-att-stat" key={i}>
                <span className="std-att-dot" style={{ background: s.color }}></span>
                <div>
                  <div className="std-att-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="std-att-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="std-card std-quick-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-zap" style={{ color: "#E8541A", marginRight: 6 }}></i>Quick Actions</h3>
          </div>
          <div className="std-qa-grid">
            {quickActions.map((a, i) => (
              <button key={i} className="std-qa-btn">
                <div className="std-qa-icon" style={{ background: a.bg, color: a.color }}>
                  <i className={a.icon}></i>
                </div>
                <span className="std-qa-label">{a.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Homework + Exams + Events ── */}
      <div className="std-bot-row">

        {/* Homework */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-book" style={{ color: P, marginRight: 6 }}></i>Latest Homework</h3>
            <span className="std-badge-pill">{dashboard.pendingHomework} tasks</span>
          </div>
          {homework.length === 0 ? (
            <div className="std-empty">No homework assigned</div>
          ) : (
            <div className="std-hw-list">
              {homework.map((item, i) => (
                <div className="std-hw-item" key={i}>
                  <div className="std-hw-badge">{(item.subject || "SUB").slice(0, 4).toUpperCase()}</div>
                  <div className="std-hw-info">
                    <span className="std-hw-title">{item.description}</span>
                    <span className="std-hw-due">Due: {item.date}</span>
                  </div>
                  <span className="std-badge-pill std-badge-warn">Pending</span>
                </div>
              ))}
            </div>
          )}
          <button className="std-view-all">View all homework <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Exams */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-edit" style={{ color: P, marginRight: 6 }}></i>Upcoming Exams</h3>
            <span className="std-badge-pill">{dashboard.upcomingExams} exams</span>
          </div>
          {exams.length === 0 ? (
            <div className="std-empty">No upcoming exams</div>
          ) : (
            <div className="std-exam-list">
              {exams.map((exam, i) => (
                <div className="std-exam-item" key={i}>
                  <div className="std-exam-date-box">
                    <span className="std-exam-date">{exam.date || "TBD"}</span>
                  </div>
                  <div className="std-exam-info">
                    <span className="std-exam-subject">{exam.exam}</span>
                    <span className="std-exam-cls">{exam.className}</span>
                  </div>
                  <span className="std-exam-marks">{exam.totalMark}M</span>
                </div>
              ))}
            </div>
          )}
          <button className="std-view-all">View all exams <i className="bx bx-chevron-right"></i></button>
        </div>

        {/* Events */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-calendar-event" style={{ color: P, marginRight: 6 }}></i>Upcoming Events</h3>
            <span className="std-badge-pill std-badge-green">{dashboard.upcomingEvents} events</span>
          </div>
          {events.length === 0 ? (
            <div className="std-empty">No upcoming events</div>
          ) : (
            <div className="std-event-list">
              {events.map((ev, i) => (
                <div className="std-event-item" key={i}>
                  <div className="std-event-date">
                    <span className="std-event-day">{ev.fromDate ? new Date(ev.fromDate).getDate() : "--"}</span>
                    <small>{ev.fromDate ? new Date(ev.fromDate).toLocaleString("default", { month: "short" }) : ""}</small>
                  </div>
                  <div className="std-event-info">
                    <span className="std-event-name">{ev.eventName}</span>
                    <span className="std-event-desc">{ev.description || "School Event"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="std-view-all">View all events <i className="bx bx-chevron-right"></i></button>
        </div>
      </div>

      {/* ── Row 4: Notice Board + Recent Activity ── */}
      <div className="std-bot-row2">

        {/* Notice Board */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-bell" style={{ color: P, marginRight: 6 }}></i>Notice Board</h3>
            <span className="std-badge-pill">{notices.length} notices</span>
          </div>
          <div className="std-notice-list">
            {notices.map((n, i) => (
              <div className="std-notice-item" key={i}>
                <div className="std-notice-icon" style={{ background: n.bg, color: n.color }}>
                  <i className={n.icon}></i>
                </div>
                <div className="std-notice-body">
                  <span className="std-notice-title">{n.title}</span>
                  <span className="std-notice-desc">{n.desc}</span>
                  <span className="std-notice-time">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bx-pulse" style={{ color: P, marginRight: 6 }}></i>Recent Activity</h3>
            <span className="std-badge-pill std-badge-green">Today</span>
          </div>
          <ul className="std-activity-list">
            {recentActivity.map((a, i) => (
              <li key={i} className="std-activity-item">
                <div className="std-act-avatar" style={{ background: a.color }}>{a.avatar}</div>
                <div className="std-act-info">
                  <span className="std-act-name">{a.label}</span>
                  <span className="std-act-action">{a.desc}</span>
                </div>
                <span className="std-act-time">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Performance Summary */}
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bx-bar-chart" style={{ color: P, marginRight: 6 }}></i>Performance Summary</h3>
          </div>
          <div className="std-perf-grid">
            {[
              { label: "Attendance",    val: `${dashboard.attendancePercent}%`, color: "#16a34a", bg: "#dcfce7" },
              { label: "Homework",      val: dashboard.pendingHomework,         color: "#d97706", bg: "#fef3c7" },
              { label: "Exams",         val: dashboard.upcomingExams,           color: "#2D3A8C", bg: "#eef0fb" },
              { label: "Events",        val: dashboard.upcomingEvents,          color: "#EC4899", bg: "#FCE7F3" },
            ].map((p, i) => (
              <div className="std-perf-box" key={i} style={{ background: p.bg }}>
                <div className="std-perf-val" style={{ color: p.color }}>{p.val}</div>
                <div className="std-perf-label">{p.label}</div>
              </div>
            ))}
          </div>

          {/* Motivation strip */}
          <div className="std-motivation">
            <div>
              <strong>🌟 Keep Learning!</strong>
              <p>Consistency is the key to success. Attend classes, complete homework and give your best in every exam.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
