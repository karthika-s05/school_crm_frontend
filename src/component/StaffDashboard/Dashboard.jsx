import React, { useState, useEffect, useMemo } from "react";
import "./Dashboard.css";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getStaffDashboardSummary } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const KST_NAVY = "#1e3a8a";
const KST_ORANGE = "#fb923c";

const weeklyData = [
  { day: "Mon", present: 42, absent: 3 },
  { day: "Tue", present: 40, absent: 5 },
  { day: "Wed", present: 44, absent: 1 },
  { day: "Thu", present: 38, absent: 7 },
  { day: "Fri", present: 43, absent: 2 },
];

const attendTrend = [
  { week: "W1", pct: 88 },
  { week: "W2", pct: 82 },
  { week: "W3", pct: 91 },
  { week: "W4", pct: 80 },
];

const upcomingEvents = [
  { icon: "bx bxs-book-open",      color: KST_NAVY,   label: "Math Exam",      date: "Dec 20", time: "10:00 AM" },
  { icon: "bx bxs-calendar-event", color: KST_ORANGE, label: "Annual Day",     date: "Dec 25", time: "9:00 AM"  },
  { icon: "bx bxs-notepad",        color: "#22c55e",  label: "Assignment Due", date: "Dec 22", time: "11:59 PM" },
  { icon: "bx bxs-time",           color: "#8b5cf6",  label: "Parent Meeting", date: "Dec 28", time: "3:00 PM"  },
];

const navItems = [
  { label: "Dashboard", icon: "bx bx-home", active: true },
  { label: "Students", icon: "bx bxs-graduation" },
  { label: "Teachers", icon: "bx bx-user" },
  { label: "Events", icon: "bx bx-calendar-event" },
  { label: "Reports", icon: "bx bx-bar-chart-alt-2" },
];

const DEFAULT_SUMMARY_TILES = [
  { label: "Students", value: "932", detail: "Active this month", icon: "bx bxs-graduation", color: "#4f46e5" },
  { label: "Teachers", value: "54", detail: "Full-time staff", icon: "bx bxs-user-account", color: "#10b981" },
  { label: "Events", value: "14", detail: "Upcoming items", icon: "bx bxs-calendar", color: "#f59e0b" },
  { label: "Feedback", value: "4.9", detail: "Student rating", icon: "bx bxs-star", color: "#ef4444" },
];

const rightStudents = [
  { initials: "SW", name: "Samantha Williams", role: "Grade 8" },
  { initials: "LT", name: "Lily Tanner", role: "Grade 9" },
  { initials: "MK", name: "Mia Khan", role: "Grade 7" },
];

const sidebarCards = [
  { label: "My Attendance", value: "80%", icon: "bx bxs-calendar-check" },
  { label: "Total Leave", value: "16", icon: "bx bxs-calendar-x" },
];

const StaffDashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    runApi(() => getStaffDashboardSummary(token), {
      onSuccess: (res) => setSummary(res?.data || null),
    });
  }, []);

  const summaryTiles = useMemo(() => {
    if (!summary) return DEFAULT_SUMMARY_TILES;
    return [
      {
        ...DEFAULT_SUMMARY_TILES[0],
        value: String(summary.assignedClasses ?? DEFAULT_SUMMARY_TILES[0].value),
        detail: "Assigned classes",
      },
      {
        ...DEFAULT_SUMMARY_TILES[1],
        value: String(summary.homeworkCount ?? DEFAULT_SUMMARY_TILES[1].value),
        detail: "Homework items",
      },
      {
        ...DEFAULT_SUMMARY_TILES[2],
        value: String(summary.upcomingEvents ?? DEFAULT_SUMMARY_TILES[2].value),
        detail: "Upcoming items",
      },
      {
        ...DEFAULT_SUMMARY_TILES[3],
        value: String(summary.totalLeaves ?? DEFAULT_SUMMARY_TILES[3].value),
        detail: summary.pendingLeaves != null
          ? `${summary.pendingLeaves} pending leave`
          : DEFAULT_SUMMARY_TILES[3].detail,
      },
    ];
  }, [summary]);

  return (
  <div className="staff-dash">
    <aside className="staff-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">A</span>
        <div>
          <strong>Akademi</strong>
          <p>School Admin</p>
        </div>
      </div>
      <ul className="sidebar-menu">
        {navItems.map((item, idx) => (
          <li key={idx} className={item.active ? "active" : ""}>
            <i className={item.icon}></i>
            {item.label}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <span>Need help?</span>
        <button>Support</button>
      </div>
    </aside>

    <div className="staff-page">
      <header className="staff-header">
        <div>
          <p className="small-label">Welcome back,</p>
          <h1>Staff Dashboard</h1>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <i className="bx bx-search"></i>
            <input type="search" placeholder="Search students, events..." />
          </div>
          <button className="primary-btn">New Report</button>
          <div className="profile-pill">KS</div>
        </div>
      </header>

      <section className="summary-grid">
        {summaryTiles.map((tile, idx) => (
          <article className="summary-card" key={idx}>
            <div className="tile-icon" style={{ background: `${tile.color}22`, color: tile.color }}>
              <i className={tile.icon}></i>
            </div>
            <div>
              <p>{tile.label}</p>
              <h2>{tile.value}</h2>
              <small>{tile.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h3>School Performance</h3>
              <p>Attendance rates over the last four weeks.</p>
            </div>
            <span className="pill">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={attendTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 13, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 13, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "none", fontSize: 13 }} />
              <Area type="monotone" dataKey="pct" name="Attendance" stroke="#06B6D4" strokeWidth={3} fill="url(#attGrad)" dot={{ r: 4, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-stats">
            <div>
              <span>Present</span>
              <strong>87%</strong>
            </div>
            <div>
              <span>Absent</span>
              <strong>13%</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card stats-card">
          <div className="card-header">
            <div>
              <h3>Quick Overview</h3>
              <p>Personal staff metrics at a glance.</p>
            </div>
          </div>
          <div className="stats-list">
            {sidebarCards.map((card, idx) => (
              <div className="stat-item" key={idx}>
                <div className="stat-badge"><i className={card.icon}></i></div>
                <div>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="progress-group">
            <p>Average class completion</p>
            <div className="progress-bar"><span style={{ width: "72%" }}></span></div>
          </div>
        </div>

        <div className="dashboard-card event-list-card">
          <div className="card-header">
            <div>
              <h3>Upcoming Events</h3>
              <p>Events in the next 7 days.</p>
            </div>
          </div>
          <ul className="staff-event-list">
            {upcomingEvents.map((ev, i) => (
              <li key={i} className="staff-event-item">
                <div className="staff-event-icon" style={{ background: ev.color + "22", color: ev.color }}>
                  <i className={ev.icon}></i>
                </div>
                <div className="staff-event-info">
                  <span>{ev.label}</span>
                  <small>{ev.date} · {ev.time}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>

    <aside className="staff-right">
      <div className="right-card profile-card">
        <div className="profile-summary">
          <div>
            <span>Welcome back</span>
            <strong>Kristen Scott</strong>
          </div>
          <div className="profile-avatar">KS</div>
        </div>
        <p>Review the latest updates and stay on top of school activity.</p>
        <div className="profile-metrics">
          <div>
            <strong>80%</strong>
            <span>Attendance</span>
          </div>
          <div>
            <strong>16</strong>
            <span>Leaves</span>
          </div>
        </div>
      </div>

      <div className="right-card student-card">
        <div className="card-header">
          <h4>Recent Students</h4>
          <button>View all</button>
        </div>
        <ul className="recent-list">
          {rightStudents.map((student, idx) => (
            <li key={idx}>
              <span className="recent-avatar">{student.initials}</span>
              <div>
                <strong>{student.name}</strong>
                <small>{student.role}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="right-card message-card">
        <div className="card-header">
          <h4>Messages</h4>
          <button>See all</button>
        </div>
        <div className="message-item">
          <div>
            <strong>Admin Team</strong>
            <p>Monthly attendance report is ready.</p>
          </div>
          <span>2m ago</span>
        </div>
        <div className="message-item">
          <div>
            <strong>Math Dept</strong>
            <p>Exam schedule update for next week.</p>
          </div>
          <span>1h ago</span>
        </div>
      </div>
    </aside>
  </div>
  );
};

export default StaffDashboard;
