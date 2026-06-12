import React, { useState } from "react";
import "./AdminDashboard.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";

/* ══════════════════════════════════════
   ENGLISH COLOUR PALETTE
   Navy      #1B3A5C  – Royal Navy Blue
   Burgundy  #7D1128  – Windsor Burgundy
   Forest    #2D6A4F  – Forest Green
   Gold      #B8860B  – Old Gold
   Slate     #4A5568  – Slate Grey
   Teal      #1A5F7A  – Cambridge Teal
   Crimson   #C0392B  – English Crimson
   Ochre     #C47A1E  – English Ochre
══════════════════════════════════════ */
const ENG = {
  navy:    "#1B3A5C",
  burgundy:"#7D1128",
  forest:  "#2D6A4F",
  gold:    "#B8860B",
  slate:   "#4A5568",
  teal:    "#1A5F7A",
  crimson: "#C0392B",
  ochre:   "#C47A1E",
};

const statCards = [
  { label: "Total Students",   value: "1,240",    sub: "+24 this month",          icon: "bx bxs-group",          color: ENG.navy,    bg: "#dce8f5", trend: "+2.0%",    up: true  },
  { label: "Total Teachers",   value: "86",       sub: "42 male · 44 female",     icon: "bx bxs-user-badge",     color: ENG.teal,    bg: "#d6edf5", trend: "+1.2%",    up: true  },
  { label: "Attendance Today", value: "94.6%",    sub: "1,174 / 1,240 present",   icon: "bx bxs-calendar-check", color: ENG.forest,  bg: "#d4edde", trend: "+3.1%",    up: true  },
  { label: "Fees Collected",   value: "₹4,82,000",sub: "This month",              icon: "bx bxs-wallet-alt",     color: ENG.gold,    bg: "#f5ecd1", trend: "+8.4%",    up: true  },
  { label: "Pending Fees",     value: "₹68,500",  sub: "42 students pending",     icon: "bx bxs-error-circle",   color: ENG.crimson, bg: "#f5d5d0", trend: "-12%",     up: false },
  { label: "Total Classes",    value: "32",       sub: "8 grades · 4 sections",   icon: "bx bxs-school",         color: ENG.slate,   bg: "#e2e6ed", trend: "Stable",   up: true  },
  { label: "Upcoming Exams",   value: "6",        sub: "Next: Math — Dec 20",     icon: "bx bxs-notepad",        color: ENG.burgundy,bg: "#f0d5da", trend: "This week", up: true  },
  { label: "Total Parents",    value: "980",      sub: "+8 registered",           icon: "bx bxs-home-heart",     color: ENG.ochre,   bg: "#f5e6cc", trend: "+0.8%",    up: true  },
];

const attendanceData = [
  { day: "Mon", present: 1180, absent: 60 },
  { day: "Tue", present: 1160, absent: 80 },
  { day: "Wed", present: 1200, absent: 40 },
  { day: "Thu", present: 1140, absent: 100 },
  { day: "Fri", present: 1174, absent: 66 },
];

const attendanceTrend = [
  { month: "Jul", pct: 91 },
  { month: "Aug", pct: 88 },
  { month: "Sep", pct: 93 },
  { month: "Oct", pct: 95 },
  { month: "Nov", pct: 92 },
  { month: "Dec", pct: 94 },
];

/* Pie uses English palette — large dominant + distinct accent slices */
const feeData = [
  { name: "Collected",   value: 482000, color: ENG.navy    },
  { name: "Pending",     value: 68500,  color: ENG.crimson },
  { name: "Waived",      value: 15000,  color: ENG.gold    },
  { name: "Scholarship", value: 24500,  color: ENG.forest  },
];

const feeMonthly = [
  { month: "Jul", collected: 320000, pending: 45000 },
  { month: "Aug", collected: 410000, pending: 52000 },
  { month: "Sep", collected: 390000, pending: 38000 },
  { month: "Oct", collected: 450000, pending: 60000 },
  { month: "Nov", collected: 470000, pending: 55000 },
  { month: "Dec", collected: 482000, pending: 68500 },
];

const upcomingExams = [
  { subject: "Mathematics",    cls: "Class 10", date: "Dec 20", type: "Final",     color: ENG.navy    },
  { subject: "Science",        cls: "Class 9",  date: "Dec 22", type: "Unit",      color: ENG.forest  },
  { subject: "English",        cls: "Class 8",  date: "Dec 24", type: "Mid-term",  color: ENG.teal    },
  { subject: "Social Studies", cls: "Class 7",  date: "Dec 26", type: "Unit",      color: ENG.burgundy},
  { subject: "Hindi",          cls: "Class 10", date: "Dec 28", type: "Final",     color: ENG.gold    },
  { subject: "Computer",       cls: "Class 6",  date: "Dec 30", type: "Practical", color: ENG.slate   },
];

const recentActivity = [
  { avatar: "AA", name: "Aarav Sharma",  action: "Enrolled in Class 10A",  time: "10 min ago", color: ENG.navy     },
  { avatar: "PR", name: "Priya Nair",    action: "Fee payment received",   time: "32 min ago", color: ENG.forest   },
  { avatar: "MK", name: "Mr. Karthik",   action: "Uploaded timetable",     time: "1 hr ago",   color: ENG.teal     },
  { avatar: "SV", name: "Sneha Verma",   action: "Attendance marked — 9B", time: "2 hrs ago",  color: ENG.burgundy },
  { avatar: "RG", name: "Rahul Gupta",   action: "Exam result published",  time: "Yesterday",  color: ENG.gold     },
];

const classAttendance = [
  { cls: "Class 10", present: 118, total: 120, pct: 98, color: ENG.navy    },
  { cls: "Class 9",  present: 112, total: 120, pct: 93, color: ENG.teal    },
  { cls: "Class 8",  present: 108, total: 115, pct: 94, color: ENG.forest  },
  { cls: "Class 7",  present: 105, total: 110, pct: 95, color: ENG.slate   },
  { cls: "Class 6",  present: 98,  total: 108, pct: 91, color: ENG.gold    },
  { cls: "Class 5",  present: 95,  total: 105, pct: 90, color: ENG.ochre   },
];

const fmt = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;

const TICK = { fontSize: 12, fill: "#6b7280", fontFamily: "Poppins" };
const TOOLTIP_STYLE = { borderRadius: 10, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.09)", fontSize: 12, fontFamily: "Poppins" };

const AdminDashboard = () => {
  const [attView, setAttView] = useState("week");
  const [feeView, setFeeView] = useState("pie");
  const totalFee = feeData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="kst-dash">

      {/* ── Row 1: 8 Stat Cards ── */}
      <div className="kst-stat-row">
        {statCards.map((c, i) => (
          <div className="kst-stat-card" key={i} style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="kst-sc-top">
              <div className="kst-stat-icon" style={{ background: c.bg, color: c.color }}>
                <i className={c.icon}></i>
              </div>
              <span className={`kst-sc-trend ${c.up ? "up" : "down"}`}>
                <i className={`bx ${c.up ? "bx-trending-up" : "bx-trending-down"}`}></i>
                {c.trend}
              </span>
            </div>
            <div className="kst-sc-body">
              <div className="kst-stat-val">{c.value}</div>
              <div className="kst-stat-label">{c.label}</div>
              <div className="kst-stat-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Attendance + Fee ── */}
      <div className="kst-chart-row">

        {/* Student Attendance */}
        <div className="kst-card">
          <div className="kst-card-header">
            <div>
              <h3>Student Attendance</h3>
              <p className="kst-chart-sub">Weekly present vs absent</p>
            </div>
            <div className="kst-tabs">
              {["week", "trend"].map((v) => (
                <button key={v} className={`kst-tab${attView === v ? " active" : ""}`} onClick={() => setAttView(v)}>
                  {v === "week" ? "This Week" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          {attView === "week" ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={attendanceData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, fontFamily: "Poppins" }} />
                <Bar dataKey="present" name="Present" fill={ENG.navy}    radius={[5, 5, 0, 0]} />
                <Bar dataKey="absent"  name="Absent"  fill={ENG.crimson} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={attendanceTrend} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={ENG.teal} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={ENG.teal} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke={ENG.teal} strokeWidth={2.5}
                  fill="url(#attGrad)" dot={{ r: 4, fill: ENG.gold, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Stats strip */}
          <div className="kst-att-stats">
            {[
              { label: "Present", val: "1,174", color: ENG.navy    },
              { label: "Absent",  val: "66",    color: ENG.crimson },
              { label: "Leave",   val: "12",    color: ENG.gold    },
              { label: "Rate",    val: "94.6%", color: ENG.forest  },
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
        <div className="kst-card">
          <div className="kst-card-header">
            <div>
              <h3>Fee Collection</h3>
              <p className="kst-chart-sub">Total: {fmt(totalFee)}</p>
            </div>
            <div className="kst-tabs">
              {["pie", "bar"].map((v) => (
                <button key={v} className={`kst-tab${feeView === v ? " active" : ""}`} onClick={() => setFeeView(v)}>
                  {v === "pie" ? "Breakdown" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          {feeView === "pie" ? (
            <>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={feeData}
                    cx="50%" cy="50%"
                    innerRadius={0}
                    outerRadius={105}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {feeData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>

              <div className="kst-fee-legend">
                {feeData.map((d, i) => (
                  <div className="kst-fee-leg-item" key={i}>
                    <span className="kst-legend-dot" style={{ background: d.color }}></span>
                    <span className="kst-fee-leg-name">{d.name}</span>
                    <span className="kst-fee-leg-val">{fmt(d.value)}</span>
                    <span className="kst-fee-leg-pct" style={{ color: d.color }}>
                      {Math.round((d.value / totalFee) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={feeMonthly} margin={{ top: 4, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" vertical={false} />
                <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ ...TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={fmt} contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, fontFamily: "Poppins" }} />
                <Bar dataKey="collected" name="Collected" fill={ENG.navy}    radius={[5, 5, 0, 0]} />
                <Bar dataKey="pending"   name="Pending"   fill={ENG.crimson} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row 3: Exams + Activity + Class Attendance ── */}
      <div className="kst-bot-row">

        {/* Upcoming Exams */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3>Upcoming Exams</h3>
            <span className="kst-badge-pill">Next 2 weeks</span>
          </div>
          <div className="kst-exam-list">
            {upcomingExams.map((e, i) => (
              <div className="kst-exam-item" key={i}>
                <div className="kst-exam-date-box" style={{ background: e.color + "18", borderLeft: `4px solid ${e.color}` }}>
                  <span className="kst-exam-date">{e.date}</span>
                </div>
                <div className="kst-exam-info">
                  <span className="kst-exam-subject">{e.subject}</span>
                  <span className="kst-exam-cls">{e.cls}</span>
                </div>
                <span className="kst-exam-type" style={{ background: e.color + "18", color: e.color }}>
                  {e.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3>Recent Activity</h3>
            <span className="kst-badge-pill">Today</span>
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
        </div>

        {/* Class-wise Attendance */}
        <div className="kst-card">
          <div className="kst-card-header">
            <h3>Class-wise Attendance</h3>
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
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
