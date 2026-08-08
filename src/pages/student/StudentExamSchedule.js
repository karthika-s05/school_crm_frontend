import React, { useEffect, useMemo, useState } from "react";
import { getexamPortion } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { MONTH_LABELS as MONTHS, parseApiDate as parseDate } from "../../utils/date";
import "./StudentModules.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const daysUntil = (date) => {
  if (!date) return null;
  const exam = new Date(date);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam - startOfToday()) / 86400000);
};

const countdown = (date) => {
  const days = daysUntil(date);
  if (days == null) return null;
  if (days === 0) return { cls: "today", text: "Today" };
  if (days === 1) return { cls: "soon", text: "Tomorrow" };
  if (days <= 7) return { cls: "soon", text: `In ${days} days` };
  return { cls: "later", text: `In ${days} days` };
};

/** "10:00 AM" / "14:30" → minutes past midnight. */
const toMinutes = (value) => {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = (match[3] || "").toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const duration = (from, to) => {
  const start = toMinutes(from);
  const end = toMinutes(to);
  if (start == null || end == null || end <= start) return "";
  const total = end - start;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
};

const longDate = (date) =>
  date
    ? `${WEEKDAYS[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")} ${
        MONTHS[date.getMonth()]
      } ${date.getFullYear()}`
    : "Date to be announced";

const StudentExamSchedule = () => {
  const token = getToken();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    runApi(() => getexamPortion({}, token), {
      onSuccess: (res) => {
        setRows(Array.isArray(res?.data) ? res.data : []);
      },
      onError: () => {
        setRows([]);
        setError("Unable to load exam schedule.");
      },
    }).finally(() => setLoading(false));
  }, [token]);

  const upcoming = useMemo(() => {
    const today = startOfToday();
    return rows
      .map((item, index) => {
        const date = parseDate(item.examDate);
        return {
          key: `${item.id || index}-${item.subjectId || item.subject || index}`,
          date,
          days: daysUntil(date),
          subject: item.subject || item.subjectName || "Subject",
          exam: item.examName || item.exam || "Exam",
          from: item.examFromTime || item.startTime || "",
          to: item.examToTime || item.endTime || "",
          totalMarks: item.totalMarks ?? item.totalMark ?? null,
          portion: item.portionTitle || item.portionDescription || "",
          classLabel: [item.class || item.className, item.section]
            .filter(Boolean)
            .join(" · "),
        };
      })
      .filter((item) => !item.date || item.date >= today)
      .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
  }, [rows]);

  const groups = useMemo(() => {
    const map = new Map();
    upcoming.forEach((item) => {
      if (!map.has(item.exam)) map.set(item.exam, []);
      map.get(item.exam).push(item);
    });
    return [...map.entries()].map(([name, items]) => ({ name, items }));
  }, [upcoming]);

  const nextExam = upcoming.find((item) => item.date);
  const thisWeek = upcoming.filter(
    (item) => item.days != null && item.days <= 7
  ).length;
  const subjectCount = new Set(upcoming.map((item) => item.subject)).size;

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading exam schedule...
      </div>
    );
  }

  if (error) {
    return (
      <div className="sm-page">
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!upcoming.length) {
    return (
      <div className="sm-page">
        <div className="sm-empty">
          <i className="bx bx-calendar-x"></i>
          <p className="sm-empty-title">No Upcoming Exams</p>
          <p className="sm-empty-sub">
            Your exam schedule will appear here once published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm-page">
      {nextExam && (
        <section className="sm-sch-next">
          <div className="sm-sch-next-main">
            <div className="sm-sch-next-count">
              <span className="sm-sch-next-num">
                {nextExam.days === 0 ? "Today" : nextExam.days}
              </span>
              {nextExam.days !== 0 && (
                <span className="sm-sch-next-unit">
                  {nextExam.days === 1 ? "day to go" : "days to go"}
                </span>
              )}
            </div>
            <div className="sm-sch-next-copy">
              <span className="sm-sch-next-eyebrow">Next exam</span>
              <h2>{nextExam.subject}</h2>
              <p>
                {nextExam.exam}
                {nextExam.classLabel ? ` · ${nextExam.classLabel}` : ""}
              </p>
            </div>
          </div>

          <div className="sm-sch-next-meta">
            <span>
              <i className="bx bx-calendar"></i> {longDate(nextExam.date)}
            </span>
            <span>
              <i className="bx bx-time-five"></i>{" "}
              {nextExam.from && nextExam.to
                ? `${nextExam.from} – ${nextExam.to}`
                : "Time to be announced"}
            </span>
          </div>
        </section>
      )}

      <div className="sm-sch-stats">
        <div className="sm-sch-stat">
          <i className="bx bx-list-check"></i>
          <div>
            <strong>{upcoming.length}</strong>
            <span>Upcoming exams</span>
          </div>
        </div>
        <div className="sm-sch-stat">
          <i className="bx bx-alarm"></i>
          <div>
            <strong>{thisWeek}</strong>
            <span>Within 7 days</span>
          </div>
        </div>
        <div className="sm-sch-stat">
          <i className="bx bx-book-bookmark"></i>
          <div>
            <strong>{subjectCount}</strong>
            <span>Subjects</span>
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <section className="sm-sch-group" key={group.name}>
          <header className="sm-sch-group-head">
            <div className="sm-sch-group-icon">
              <i className="bx bxs-calendar-star"></i>
            </div>
            <div>
              <h3>{group.name}</h3>
              <p>
                {group.items.length}{" "}
                {group.items.length === 1 ? "paper" : "papers"}
                {group.items[0]?.date && group.items[group.items.length - 1]?.date
                  ? ` · ${longDate(group.items[0].date)} – ${longDate(
                      group.items[group.items.length - 1].date
                    )}`
                  : ""}
              </p>
            </div>
          </header>

          <ol className="sm-sch-timeline">
            {group.items.map((item) => {
              const cd = countdown(item.date);
              const span = duration(item.from, item.to);
              return (
                <li
                  className={`sm-sch-item${item.days === 0 ? " is-today" : ""}`}
                  key={item.key}
                >
                  <div className={`sm-sch-date ${cd?.cls || "later"}`}>
                    <span className="sm-sch-date-weekday">
                      {item.date ? WEEKDAYS[item.date.getDay()] : "--"}
                    </span>
                    <span className="sm-sch-date-day">
                      {item.date ? item.date.getDate() : "?"}
                    </span>
                    <span className="sm-sch-date-month">
                      {item.date ? MONTHS[item.date.getMonth()] : "TBD"}
                    </span>
                  </div>

                  <div className="sm-sch-body">
                    <div className="sm-sch-subject">
                      {item.subject}
                      {item.days === 0 && (
                        <span className="sm-sch-live">Today</span>
                      )}
                    </div>
                    <div className="sm-sch-meta">
                      <span>
                        <i className="bx bx-time-five"></i>
                        {item.from && item.to
                          ? `${item.from} – ${item.to}`
                          : "Time TBA"}
                      </span>
                      {span && (
                        <span>
                          <i className="bx bx-hourglass"></i>
                          {span}
                        </span>
                      )}
                      {item.totalMarks != null && item.totalMarks !== "" && (
                        <span>
                          <i className="bx bx-trophy"></i>
                          {item.totalMarks} marks
                        </span>
                      )}
                    </div>
                    {item.portion && (
                      <p className="sm-sch-portion">
                        <i className="bx bx-book-content"></i> {item.portion}
                      </p>
                    )}
                  </div>

                  {cd && (
                    <span className={`sm-countdown ${cd.cls}`}>{cd.text}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
};

export default StudentExamSchedule;
