import React, { useEffect, useMemo, useState } from "react";
import { getexamPortion } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import "./StudentModules.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const countdown = (date) => {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(date);
  exam.setHours(0, 0, 0, 0);
  const days = Math.round((exam - today) / 86400000);
  if (days === 0) return { cls: "today", text: "Today" };
  if (days === 1) return { cls: "soon", text: "Tomorrow" };
  if (days <= 7) return { cls: "soon", text: `In ${days} days` };
  return { cls: "later", text: `In ${days} days` };
};

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
        const list = Array.isArray(res?.data) ? res.data : [];
        setRows(list);
      },
      onError: () => {
        setRows([]);
        setError("Unable to load exam schedule.");
      },
    }).finally(() => setLoading(false));
  }, [token]);

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...rows]
      .filter((item) => {
        const examDate = parseDate(item.examDate);
        if (!examDate) return true;
        examDate.setHours(0, 0, 0, 0);
        return examDate >= today;
      })
      .sort((a, b) => (parseDate(a.examDate) || 0) - (parseDate(b.examDate) || 0));
  }, [rows]);

  const nextExam = upcoming.find((item) => parseDate(item.examDate));

  if (loading) {
    return (
      <div className="sm-loading">
        <div className="sm-spinner"></div>
        Loading exam schedule...
      </div>
    );
  }

  return (
    <div className="sm-page">
      {/* Hero header */}
      {/* <div className="sm-hero">
        <div className="sm-hero-left">
          <div className="sm-hero-icon"><i className="bx bxs-calendar-event"></i></div>
          <div>
            <h2 className="sm-hero-title">Exam Schedule</h2>
            <p className="sm-hero-sub">Your upcoming exams for the current class and section</p>
          </div>
        </div>
        <div className="sm-hero-stats">
          <div className="sm-hero-stat">
            <div className="sm-hero-stat-val">{upcoming.length}</div>
            <div className="sm-hero-stat-label">Upcoming</div>
          </div>
          {nextExam && (
            <div className="sm-hero-stat">
              <div className="sm-hero-stat-val">
                {countdown(parseDate(nextExam.examDate))?.text === "Today"
                  ? "Today"
                  : parseDate(nextExam.examDate).getDate()}
              </div>
              <div className="sm-hero-stat-label">
                {countdown(parseDate(nextExam.examDate))?.text === "Today"
                  ? "Next Exam"
                  : `Next · ${MONTHS[parseDate(nextExam.examDate).getMonth()]}`}
              </div>
            </div>
          )}
        </div>
      </div> */}

      {/* Content */}
      {error ? (
        <div className="sm-error">
          <i className="bx bx-error-circle"></i>
          <span>{error}</span>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="sm-empty">
          <i className="bx bx-calendar-x"></i>
          <p className="sm-empty-title">No Upcoming Exams</p>
          <p className="sm-empty-sub">Your exam schedule will appear here once published.</p>
        </div>
      ) : (
        <div className="sm-exam-list">
          {upcoming.map((item, index) => {
            const date = parseDate(item.examDate);
            const cd = countdown(date);
            return (
              <div
                className="sm-exam-card"
                key={`${item.id || index}-${item.subjectId || item.subject || "subject"}`}
              >
                <div className="sm-exam-date-block">
                  <div className="sm-exam-date-day">{date ? date.getDate() : "?"}</div>
                  <div className="sm-exam-date-month">{date ? MONTHS[date.getMonth()] : "TBD"}</div>
                </div>
                <div className="sm-exam-info">
                  <div className="sm-exam-name">
                    {item.subject || item.subjectName || "Subject"}
                  </div>
                  <div className="sm-exam-detail-row">
                    <span className="sm-subject-pill">{item.exam || item.examName || "Exam"}</span>
                    <span className="sm-date-text">
                      <i className="bx bx-time-five"></i>{" "}
                      {item.examFromTime || item.startTime || "TBD"} – {item.examToTime || item.endTime || "TBD"}
                    </span>
                    <span className="sm-date-text">
                      <i className="bx bx-building"></i> Hall: {item.hall || item.hallName || "-"}
                    </span>
                  </div>
                </div>
                {cd && <span className={`sm-countdown ${cd.cls}`}>{cd.text}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentExamSchedule;
