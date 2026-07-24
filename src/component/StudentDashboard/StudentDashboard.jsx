import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import {
  getHomework,
  getStudentAssignment,
  getexamPortion,
  getStudentExamReport,
  getStdAttendance,
  getNotifications,
  getDay,
  getTimeTable,
  getEventSummary,
  getMyAttendanceSummaryV2,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { StudentMascot } from "../../assets/illustrations/SchoolIllustrations";

/** School day: 09:15 AM – 04:30 PM (12-hour clock). */
const SCHOOL_DAY_START = "09:15 AM";
const SCHOOL_DAY_END = "04:30 PM";

const PERIOD_SCHEDULE = [
  { key: "period-1", label: "Period 1", startTime: "09:15 AM", endTime: "10:00 AM", slotType: "normal" },
  { key: "period-2", label: "Period 2", startTime: "10:00 AM", endTime: "10:45 AM", slotType: "normal" },
  { key: "morning-break", label: "Morning Break", startTime: "10:45 AM", endTime: "11:00 AM", slotType: "break" },
  { key: "period-3", label: "Period 3", startTime: "11:00 AM", endTime: "11:45 AM", slotType: "normal" },
  { key: "period-4", label: "Period 4", startTime: "11:45 AM", endTime: "12:30 PM", slotType: "normal" },
  { key: "lunch-break", label: "Lunch Break", startTime: "12:30 PM", endTime: "01:15 PM", slotType: "lunch" },
  { key: "period-5", label: "Period 5", startTime: "01:15 PM", endTime: "02:00 PM", slotType: "normal" },
  { key: "period-6", label: "Period 6", startTime: "02:00 PM", endTime: "02:45 PM", slotType: "normal" },
  { key: "afternoon-break", label: "Afternoon Break", startTime: "02:45 PM", endTime: "03:00 PM", slotType: "break" },
  { key: "period-7", label: "Period 7", startTime: "03:00 PM", endTime: "03:45 PM", slotType: "normal" },
  { key: "period-8", label: "Period 8", startTime: "03:45 PM", endTime: "04:30 PM", slotType: "normal" },
];

const toMinutes = (t) => {
  if (!t && t !== 0) return null;
  const s = String(t).trim().toUpperCase().replace(/\./g, ":");
  const pm = s.includes("PM");
  const am = s.includes("AM");
  const clean = s.replace(/AM|PM/gi, "").trim();
  const parts = clean.split(":");
  let h = Number(parts[0]);
  const m = Number(parts[1] || 0);
  if (Number.isNaN(h)) return null;
  if (!am && !pm && h >= 0 && h <= 23) return h * 60 + (Number.isNaN(m) ? 0 : m);
  if (pm && h !== 12) h += 12;
  if (am && h === 12) h = 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
};

const format12Hour = (value) => {
  if (value == null || value === "") return "";
  const str = String(value).trim();
  if (/am|pm/i.test(str)) {
    const mins = toMinutes(str);
    if (mins == null) return str;
    let h = Math.floor(mins / 60);
    const m = mins % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
  }
  const mins = toMinutes(str);
  if (mins == null) return str;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};

const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.[0])) return value[0];
  return [];
};

const extractPeriodNumber = (row) => {
  const raw =
    row.periodSlotId ??
    row.periodId ??
    row.periodNo ??
    row.periodNumber ??
    row.period ??
    row.periodName ??
    "";
  const match = String(raw).match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const normalizeTimetableRow = (row, index = 0) => {
  const startRaw =
    row.startTime || row.fromTime || row["start Time"] || row.periodStart || row.beginTime || "";
  const endRaw =
    row.endTime || row.toTime || row["end Time"] || row.periodEnd || row.finishTime || "";
  const startTime = format12Hour(startRaw);
  const endTime = format12Hour(endRaw);
  const startMins = toMinutes(startTime || startRaw);
  const periodNumber = extractPeriodNumber(row);
  return {
    ...row,
    id: row.id || row.timetableId || index,
    periodNumber,
    periodLabel:
      row.periodName ||
      (periodNumber ? `Period ${periodNumber}` : null) ||
      row.slotName ||
      "Period",
    subjectName: row.subjectName || row.subject || row.SubjectName || "Subject",
    staffName: row.staffName || row.teacherName || row.employeeName || "Teacher",
    startTime,
    endTime,
    startMins,
    slotType: /break|lunch/i.test(String(row.periodName || row.subjectName || ""))
      ? "break"
      : "normal",
  };
};

/**
 * Find current / next period using school schedule + today's timetable rows.
 */
const resolvePeriodStatus = (timetableRows, now = new Date()) => {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const dayStart = toMinutes(SCHOOL_DAY_START);
  const dayEnd = toMinutes(SCHOOL_DAY_END);

  const normalIndexByKey = {};
  let normalCount = 0;
  PERIOD_SCHEDULE.forEach((slot) => {
    if (slot.slotType === "normal") {
      normalCount += 1;
      normalIndexByKey[slot.key] = normalCount;
    }
  });

  const mapped = PERIOD_SCHEDULE.map((slot) => {
    const startMins = toMinutes(slot.startTime);
    const endMins = toMinutes(slot.endTime);
    const periodNo = normalIndexByKey[slot.key] || null;
    const match = (timetableRows || []).find((row) => {
      if (periodNo != null && row.periodNumber === periodNo) return true;
      if (row.startMins == null || startMins == null) return false;
      return Math.abs(row.startMins - startMins) <= 2;
    });
    return {
      ...slot,
      startMins,
      endMins,
      subjectName: match?.subjectName,
      staffName: match?.staffName,
      hasClass: Boolean(match) && slot.slotType === "normal",
    };
  });

  if (nowMins < dayStart) {
    const first = mapped.find((s) => s.slotType === "normal") || mapped[0];
    return {
      phase: "before",
      message: `School starts at ${SCHOOL_DAY_START}`,
      current: null,
      next: first,
    };
  }

  if (nowMins >= dayEnd) {
    return {
      phase: "after",
      message: `School ended at ${SCHOOL_DAY_END}`,
      current: null,
      next: null,
    };
  }

  const current = mapped.find(
    (s) => s.startMins != null && s.endMins != null && nowMins >= s.startMins && nowMins < s.endMins
  );
  const nextClass = mapped.find(
    (s) => s.slotType === "normal" && s.startMins != null && s.startMins > nowMins
  );
  const nextAny = mapped.find((s) => s.startMins != null && s.startMins > nowMins);

  return {
    phase: current ? "in-session" : "between",
    message: current
      ? current.slotType === "normal"
        ? "Now"
        : current.label
      : "Break / Transition",
    current,
    next: nextClass || nextAny || null,
  };
};

const quickActions = (admissionNo) => [
  { title: "Homework", icon: "bx bx-book", color: "#2563EB", bg: "#DBEAFE", path: "/student/homework" },
  { title: "Attendance", icon: "bx bx-calendar-check", color: "#22C55E", bg: "#DCFCE7", path: "/student/attendance" },
  { title: "Exam Schedule", icon: "bx bx-edit", color: "#F97316", bg: "#FFEDD5", path: "/student/exam-schedule" },
  { title: "Results", icon: "bx bx-award", color: "#7C3AED", bg: "#F5F3FF", path: "/student/examresult" },
  { title: "Timetable", icon: "bx bx-time", color: "#06B6D4", bg: "#CFFAFE", path: "/student/timetable" },
  { title: "Events", icon: "bx bx-calendar-event", color: "#EC4899", bg: "#FCE7F3", path: "/student/events" },
  { title: "Dashboard", icon: "bx bx-home", color: "#059669", bg: "#D1FAE5", path: "/student/dashboard" },
  { title: "Profile", icon: "bx bx-user", color: "#6366F1", bg: "#EEF2FF", path: `/student/profile/${admissionNo || 0}` },
];

const flattenResults = (value) =>
  Array.isArray(value) ? value.flatMap((group) => (Array.isArray(group) ? group : [])) : [];

const formatDate = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const token = getToken();
  const studentName = getUserData("studentName") || "Student";
  const admissionNo = getUserData("admissionNo") || "";
  const classId = Number(getUserData("classId") || 0);
  const sectionId = Number(getUserData("sectionId") || 0);
  const className = getUserData("className") || classId || "-";
  const sectionName = getUserData("sectionName") || sectionId || "-";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [homework, setHomework] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [latestResults, setLatestResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [eventSummary, setEventSummary] = useState({
    upcomingEvents: [],
    holidayAnnouncements: [],
    parentMeetingNotifications: [],
    examNotifications: [],
  });
  const [todayTimetable, setTodayTimetable] = useState([]);
  const [attendance, setAttendance] = useState({
    workingDays: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });
  const [clockTick, setClockTick] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setClockTick(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      const today = new Date();
      const month = today.getMonth() + 1;

      try {
        await Promise.all([
          runApi(() => getHomework({ classId, sectionId, subjectId: 0 }, token), {
            onSuccess: (res) => setHomework(asList(res?.data ?? res)),
          }),
          runApi(() => getStudentAssignment(token), {
            onSuccess: (res) => setAssignments(asList(res?.data ?? res)),
          }),
          runApi(
            () =>
              getexamPortion(
                {
                  classId: classId || 0,
                  sectionId: sectionId || 0,
                  id: 0,
                },
                token
              ),
            {
              onSuccess: (res) => {
                const list = asList(res?.data ?? res);
                const filtered = list
                  .filter((item) => {
                    if (classId && item.classId && Number(item.classId) !== Number(classId)) {
                      return false;
                    }
                    if (!item.examDate) return true;
                    const date = new Date(item.examDate);
                    if (Number.isNaN(date.getTime())) return true;
                    date.setHours(0, 0, 0, 0);
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    return date >= todayDate;
                  })
                  .sort((a, b) => new Date(a.examDate || 0) - new Date(b.examDate || 0));
                setUpcomingExams(filtered);
              },
            }
          ),
          runApi(() => getStudentExamReport(token), {
            onSuccess: (res) => setLatestResults(flattenResults(res?.data)),
          }),
          runApi(() => getMyAttendanceSummaryV2({ month }, token), {
            onSuccess: (res) => {
              const monthly =
                res?.summary ||
                res?.data?.monthly?.summary ||
                null;
              const legacy = res?.data?.legacySummary || res?.legacySummary;
              if (monthly && (monthly.percentage != null || monthly.daysMarked != null)) {
                setAttendance({
                  workingDays: Number(monthly.daysMarked || 0),
                  present: Number(monthly.presentEquivalent || 0),
                  absent: Math.max(
                    0,
                    Number(monthly.daysMarked || 0) -
                      Number(monthly.presentEquivalent || 0)
                  ),
                  percentage: Math.round(Number(monthly.percentage || 0)),
                });
                return;
              }
              if (legacy) {
                const row = Array.isArray(legacy) ? legacy[0] : legacy;
                setAttendance({
                  workingDays: Number(row?.WorkingDays || row?.workingDays || 0),
                  present: Number(row?.prestent || row?.present || 0),
                  absent: Number(row?.absent || 0),
                  percentage: Math.round(Number(row?.percentage || 0)),
                });
              }
            },
            onError: () => {
              runApi(() => getStdAttendance({ month }, token), {
                onSuccess: (legacyRes) => {
                  const row = Array.isArray(legacyRes?.data)
                    ? legacyRes.data[0]
                    : null;
                  if (!row) return;
                  setAttendance({
                    workingDays: Number(row?.WorkingDays || 0),
                    present: Number(row?.prestent || 0),
                    absent: Number(row?.absent || 0),
                    percentage: Math.round(Number(row?.percentage || 0)),
                  });
                },
              });
            },
          }),
          runApi(() => getNotifications(token), {
            onSuccess: (res) => setNotifications(asList(res?.data ?? res)),
          }),
          runApi(() => getEventSummary(token), {
            onSuccess: (res) =>
              setEventSummary({
                upcomingEvents: res?.data?.upcomingEvents || [],
                holidayAnnouncements: res?.data?.holidayAnnouncements || [],
                parentMeetingNotifications: res?.data?.parentMeetingNotifications || [],
                examNotifications: res?.data?.examNotifications || [],
              }),
          }),
          runApi(() => getDay(token), {
            onSuccess: async (dayRes) => {
              const dayName = today.toLocaleDateString("en-IN", { weekday: "long" }).toLowerCase();
              const dayRows = asList(dayRes?.data ?? dayRes);
              const todayDay = dayRows.find(
                (item) => String(item.dayName || item.name || "").toLowerCase() === dayName
              );
              if (!todayDay) {
                setTodayTimetable([]);
                return;
              }
              const timetable = await getTimeTable(
                { classId, sectionId, dayId: Number(todayDay.id || 0) },
                token
              );
              const rows = asList(timetable).map((row, index) =>
                normalizeTimetableRow(row, index)
              );
              rows.sort((a, b) => (a.startMins ?? 0) - (b.startMins ?? 0));
              setTodayTimetable(rows);
            },
            onError: () => setTodayTimetable([]),
          }),
        ]);
      } catch {
        setError("Unable to load student dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token, classId, sectionId]);

  const pendingHomework = useMemo(
    () =>
      homework.filter(
        (item) => !["completed"].includes(String(item.progressStatus || "").toLowerCase())
      ),
    [homework]
  );

  const pendingAssignments = useMemo(
    () =>
      assignments.filter(
        (item) => !["submitted"].includes(String(item.progressStatus || "").toLowerCase())
      ),
    [assignments]
  );

  const periodStatus = useMemo(
    () => resolvePeriodStatus(todayTimetable, new Date(clockTick)),
    [todayTimetable, clockTick]
  );

  const nextPeriodCard = periodStatus.next;
  const currentPeriodCard = periodStatus.current;

  const statCards = [
    {
      label: "Attendance",
      value: `${attendance.percentage}%`,
      sub:
        attendance.workingDays > 0
          ? `${attendance.present} / ${attendance.workingDays} days`
          : "This month",
      icon: "bx bxs-calendar-check",
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      label: "Pending Homework",
      value: pendingHomework.length,
      sub: "Assigned tasks",
      icon: "bx bxs-book",
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "Pending Assignments",
      value: pendingAssignments.length,
      sub: "To submit",
      icon: "bx bxs-task",
      color: "#0891b2",
      bg: "#e0f7fa",
    },
    {
      label: "Upcoming Exams",
      value: Math.max(upcomingExams.length, eventSummary.examNotifications.length),
      sub: `${eventSummary.upcomingEvents.length} events`,
      icon: "bx bxs-edit",
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  };

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
      <div className="std-welcome-banner">
        <div className="std-welcome-text">
          <h2>{greeting()}, {studentName}!</h2>
          <p>Track your timetable, homework, assignments, exams, attendance, and notifications in one place.</p>
          <div className="std-welcome-tags">
            <span className="std-welcome-tag"><i className="bx bx-id-card"></i> {admissionNo || "Student"}</span>
            <span className="std-welcome-tag"><i className="bx bx-building"></i> Class {className} - Section {sectionName}</span>
            <span className="std-welcome-tag"><i className="bx bxs-calendar-check"></i> {attendance.percentage}% Attendance</span>
          </div>
        </div>
        <StudentMascot className="std-welcome-art" width={120} />
      </div>

      {error && <div className="std-empty">{error}</div>}

      <div className="std-stat-row">
        {statCards.map((card) => (
          <div className="std-stat-card" key={card.label}>
            <div className="std-sc-icon" style={{ background: card.bg, color: card.color }}>
              <i className={card.icon}></i>
            </div>
            <div className="std-sc-body">
              <div className="std-stat-val">{card.value}</div>
              <div className="std-stat-label">{card.label}</div>
              <div className="std-stat-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="std-chart-row">
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bx-time" style={{ color: "#2D3A8C", marginRight: 6 }}></i>Next Period</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/timetable")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          <div className="std-school-hours">
            Class hours: {SCHOOL_DAY_START} – {SCHOOL_DAY_END}
          </div>

          {periodStatus.phase === "after" ? (
            <div className="std-empty">School day is over ({SCHOOL_DAY_END})</div>
          ) : (
            <div className="std-next-period">
              {currentPeriodCard && currentPeriodCard.slotType === "normal" && (
                <div className="std-period-chip std-period-chip--now">
                  <span className="std-period-chip-label">Now</span>
                  <strong>{currentPeriodCard.label}</strong>
                  <span>
                    {currentPeriodCard.subjectName || "Free / Activity"}
                    {currentPeriodCard.staffName ? ` · ${currentPeriodCard.staffName}` : ""}
                  </span>
                  <span className="std-period-chip-time">
                    {currentPeriodCard.startTime} – {currentPeriodCard.endTime}
                  </span>
                </div>
              )}

              {currentPeriodCard && currentPeriodCard.slotType !== "normal" && (
                <div className="std-period-chip std-period-chip--break">
                  <span className="std-period-chip-label">Now</span>
                  <strong>{currentPeriodCard.label}</strong>
                  <span className="std-period-chip-time">
                    {currentPeriodCard.startTime} – {currentPeriodCard.endTime}
                  </span>
                </div>
              )}

              {nextPeriodCard ? (
                <div className="std-period-chip std-period-chip--next">
                  <span className="std-period-chip-label">Next</span>
                  <strong>{nextPeriodCard.label}</strong>
                  <span>
                    {nextPeriodCard.slotType === "normal"
                      ? nextPeriodCard.subjectName || "Subject to be updated"
                      : nextPeriodCard.label}
                    {nextPeriodCard.slotType === "normal" && nextPeriodCard.staffName
                      ? ` · ${nextPeriodCard.staffName}`
                      : ""}
                  </span>
                  <span className="std-period-chip-time">
                    {nextPeriodCard.startTime} – {nextPeriodCard.endTime}
                  </span>
                </div>
              ) : periodStatus.phase !== "after" && !currentPeriodCard ? (
                <div className="std-empty">No upcoming period right now</div>
              ) : null}

              {periodStatus.phase === "before" && (
                <div className="std-period-note">{periodStatus.message}</div>
              )}
            </div>
          )}
        </div>

        <div className="std-card std-quick-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-zap" style={{ color: "#E8541A", marginRight: 6 }}></i>Quick Actions</h3>
          </div>
          <div className="std-qa-grid">
            {quickActions(admissionNo).map((action) => (
              <button
                key={action.title}
                className="std-qa-btn"
                type="button"
                onClick={() => action.path && navigate(action.path)}
              >
                <div className="std-qa-icon" style={{ background: action.bg, color: action.color }}>
                  <i className={action.icon}></i>
                </div>
                <span className="std-qa-label">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="std-bot-row">
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-book" style={{ color: "#2D3A8C", marginRight: 6 }}></i>Homework</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/homework")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          {pendingHomework.length === 0 ? (
            <div className="std-empty">No Homework Assigned</div>
          ) : (
            <div className="std-hw-list">
              {pendingHomework.slice(0, 4).map((item, index) => (
                <div className="std-hw-item" key={`${item.id || index}-homework`}>
                  <div className="std-hw-badge">{(item.subjectName || item.subject || "SUB").slice(0, 4).toUpperCase()}</div>
                  <div className="std-hw-info">
                    <span className="std-hw-title">{item.description || item.title || "Homework"}</span>
                    <span className="std-hw-due">Due: {item.date || item.dueDate || "TBD"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-notepad" style={{ color: "#2563eb", marginRight: 6 }}></i>Assignments</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/assignment")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          {pendingAssignments.length === 0 ? (
            <div className="std-empty">No Assignments Available</div>
          ) : (
            <div className="std-hw-list">
              {pendingAssignments.slice(0, 4).map((item, index) => (
                <div className="std-hw-item" key={`${item.id || index}-assignment`}>
                  <div className="std-hw-badge">{(item.subjectName || item.subject || "ASN").slice(0, 4).toUpperCase()}</div>
                  <div className="std-hw-info">
                    <span className="std-hw-title">{item.title || "Assignment"}</span>
                    <span className="std-hw-due">Due: {item.endDate || item.dueDate || "TBD"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-edit" style={{ color: "#7c3aed", marginRight: 6 }}></i>Upcoming Exams</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/exam-schedule")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          {upcomingExams.length === 0 ? (
            <div className="std-empty">No Upcoming Exams</div>
          ) : (
            <div className="std-exam-list">
              {upcomingExams.slice(0, 4).map((item, index) => (
                <div className="std-exam-item" key={`${item.id || index}-exam`}>
                  <div className="std-exam-date-box">
                    <span className="std-exam-date">{formatDate(item.examDate)}</span>
                  </div>
                  <div className="std-exam-info">
                    <span className="std-exam-subject">{item.exam || item.examName || "Exam"}</span>
                    <span className="std-exam-cls">{item.subject || item.subjectName || "Subject"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="std-bot-row2">
        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-award" style={{ color: "#7c3aed", marginRight: 6 }}></i>Latest Exam Results</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/examresult")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          {latestResults.length === 0 ? (
            <div className="std-empty">No Exam Results Published</div>
          ) : (
            <div className="std-hw-list">
              {latestResults.slice(0, 4).map((item, index) => (
                <div className="std-hw-item" key={`${item.exam || index}-${item.subjectName || item.subject || "subject"}`}>
                  <div className="std-hw-badge">{item.grade || "--"}</div>
                  <div className="std-hw-info">
                    <span className="std-hw-title">{item.subjectName || item.subject || "Subject"}</span>
                    <span className="std-hw-due">
                      {item.obtainedMark ?? item.mark ?? "-"} / {item.totalMark ?? item.totalMarks ?? "-"} - {item.result || "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-calendar-event" style={{ color: "#ec4899", marginRight: 6 }}></i>Upcoming Events</h3>
            <button className="std-view-all" type="button" onClick={() => navigate("/student/events")}>
              View all <i className="bx bx-chevron-right"></i>
            </button>
          </div>
          {eventSummary.upcomingEvents.length === 0 &&
          eventSummary.holidayAnnouncements.length === 0 &&
          eventSummary.parentMeetingNotifications.length === 0 ? (
            <div className="std-empty">No upcoming events</div>
          ) : (
            <div className="std-notice-list">
              {[
                ...eventSummary.upcomingEvents,
                ...eventSummary.holidayAnnouncements,
                ...eventSummary.parentMeetingNotifications,
              ]
                .slice(0, 4)
                .map((item, index) => (
                  <div className="std-notice-item" key={item.id || index}>
                    <div className="std-notice-icon" style={{ background: "#FCE7F3", color: "#DB2777" }}>
                      <i className="bx bx-calendar-event"></i>
                    </div>
                    <div className="std-notice-body">
                      <span className="std-notice-title">{item.title}</span>
                      <span className="std-notice-desc">
                        {item.eventType} · {formatDate(item.eventDate)}
                        {item.eventTime ? ` · ${item.eventTime}` : ""}
                        {item.venue ? ` · ${item.venue}` : ""}
                      </span>
                      <span className="std-notice-time">Posted by {item.postedBy || item.createdBy}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bxs-bell" style={{ color: "#2D3A8C", marginRight: 6 }}></i>Notifications</h3>
            <span className="std-badge-pill">{notifications.length}</span>
          </div>
          {notifications.length === 0 ? (
            <div className="std-empty">No notifications</div>
          ) : (
            <div className="std-notice-list">
              {notifications.slice(0, 4).map((item, index) => (
                <div className="std-notice-item" key={item.id || index}>
                  <div className="std-notice-icon" style={{ background: "#DBEAFE", color: "#2563EB" }}>
                    <i className="bx bx-bell"></i>
                  </div>
                  <div className="std-notice-body">
                    <span className="std-notice-title">{item.title || "Notification"}</span>
                    <span className="std-notice-desc">{item.message || item.description || "-"}</span>
                    <span className="std-notice-time">{item.createdAt || item.time || "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="std-card">
          <div className="std-card-header">
            <h3><i className="bx bx-bar-chart" style={{ color: "#16a34a", marginRight: 6 }}></i>Attendance Summary</h3>
          </div>
          <div className="std-perf-grid">
            {[
              { label: "Working Days", val: attendance.workingDays, color: "#2D3A8C", bg: "#eef0fb" },
              { label: "Present", val: attendance.present, color: "#16a34a", bg: "#dcfce7" },
              { label: "Absent", val: attendance.absent, color: "#ef4444", bg: "#fef2f2" },
              { label: "Percentage", val: `${attendance.percentage}%`, color: "#d97706", bg: "#fef3c7" },
            ].map((item) => (
              <div className="std-perf-box" key={item.label} style={{ background: item.bg }}>
                <div className="std-perf-val" style={{ color: item.color }}>{item.val}</div>
                <div className="std-perf-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
