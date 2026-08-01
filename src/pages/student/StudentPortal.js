import React, { useState, useEffect } from "react";
import { getUserData, getToken } from "../../services/auth";
import { useLocation } from "react-router-dom";
import {
  getHomework,
  getExam,
  getexamPortion,
  getStdAttendance,
  getTimeTable,
  getEvent,
  getExamResultlist,
  getStudentAssignment,
  getTeacher,
  getClassTeacherMap,
  getStudentLeave,
  createStudentLeave,
  getLeaveTypes,
} from "../../services/api";
import { runApi } from "../../utils/apiHelper";
import "./StudentPortal.css";

const TABS = [
  "Attendance", "Marks", "Homework", "Assignments",
  "Exams", "Timetable", "Events", "ClassTeacher", "SubjectTeachers", "Leave",
];

const TAB_LABELS = {
  Attendance: "Attendance", Marks: "Marks", Homework: "Homework",
  Assignments: "Assignments", Exams: "Exams", Timetable: "Timetable",
  Events: "Events", ClassTeacher: "Class Teacher", SubjectTeachers: "Subject Teachers",
  Leave: "Leave",
};

const StudentPortal = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    TABS.includes(location.state) ? location.state : "Attendance"
  );

  useEffect(() => {
    if (TABS.includes(location.state)) setActiveTab(location.state);
  }, [location.state]);

  const classId    = Number(getUserData("classId")    || 0);
  const sectionId  = Number(getUserData("sectionId")  || 0);
  const admissionNo = getUserData("admissionNo") || "";

  const [attendance,      setAttendance]      = useState([]);
  const [homework,        setHomework]        = useState([]);
  const [assignments,     setAssignments]     = useState([]);
  const [exams,           setExams]           = useState([]);
  const [portions,        setPortions]        = useState([]);
  const [marks,           setMarks]           = useState([]);
  const [timetable,       setTimetable]       = useState([]);
  const [events,          setEvents]          = useState([]);
  const [classTeacher,    setClassTeacher]    = useState(null);
  const [subjectTeachers, setSubjectTeachers] = useState([]);
  const [leaves,          setLeaves]          = useState([]);
  const [leaveTypes,      setLeaveTypes]      = useState([]);
  const [leaveForm,       setLeaveForm]       = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [leaveMsg,        setLeaveMsg]        = useState("");
  const [loading,         setLoading]         = useState(false);

  const token = getToken();
  const today = new Date();

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    if (activeTab === "Attendance") {
      // Monthly summary API scoped to the logged-in student (JWT-based)
      runApi(
        () => getStdAttendance({ month: today.getMonth() + 1 }, token),
        { onSuccess: (res) => setAttendance(Array.isArray(res.data) ? res.data : []) }
      ).finally(() => setLoading(false));
    }

    if (activeTab === "Homework") {
      runApi(() => getHomework({ classId, sectionId, subjectId: 0 }, token), {
        onSuccess: (res) => setHomework(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "Assignments") {
      runApi(() => getStudentAssignment(token), {
        onSuccess: (res) => setAssignments(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "Marks") {
      runApi(() => getExamResultlist({ classId, sectionId, admissionNo }, token), {
        onSuccess: (res) => setMarks(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "Exams") {
      Promise.all([
        runApi(() => getExam({}, token), { onSuccess: (res) => setExams(res.data || []) }),
        runApi(() => getexamPortion({ id: 0, classId, sectionId }, token), { onSuccess: (res) => setPortions(res.data || []) }),
      ]).finally(() => setLoading(false));
    }

    if (activeTab === "Timetable") {
      runApi(() => getTimeTable({ classId, sectionId }, token), {
        onSuccess: (res) => setTimetable(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "Events") {
      runApi(() => getEvent({ id: 0 }, token), {
        onSuccess: (res) => setEvents(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "ClassTeacher") {
      runApi(() => getClassTeacherMap({ classId, sectionId }, token), {
        onSuccess: (res) => {
          const list = res.data || (Array.isArray(res) ? res : []);
          setClassTeacher(list[0] || null);
        },
      }).finally(() => setLoading(false));
    }

    if (activeTab === "SubjectTeachers") {
      runApi(() => getTeacher(token), {
        onSuccess: (res) => setSubjectTeachers(res.data || []),
      }).finally(() => setLoading(false));
    }

    if (activeTab === "Leave") {
      Promise.all([
        runApi(() => getStudentLeave(token), { onSuccess: (res) => setLeaves(res.data || []) }),
        runApi(() => getLeaveTypes(token),   { onSuccess: (res) => setLeaveTypes(res.data || []) }),
      ]).finally(() => setLoading(false));
    }
  }, [activeTab, classId, sectionId]);

  // get_student_attendance returns: [{ WorkingDays, prestent, absent, percentage, leaveDate: [...] }]
  const myAttRow = attendance[0] || null;
  const absentDates = Array.isArray(myAttRow?.leaveDate) ? myAttRow.leaveDate : [];

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveMsg("");
    await runApi(() => createStudentLeave(leaveForm, token), {
      onSuccess: () => {
        setLeaveMsg("Leave applied successfully!");
        setLeaveForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
        runApi(() => getStudentLeave(token), { onSuccess: (res) => setLeaves(res.data || []) });
      },
      onError: () => setLeaveMsg("Failed to apply leave. Please try again."),
    });
  };

  // Group marks by exam name for a clean display
  const marksByExam = marks.reduce((acc, m) => {
    const key = m.examName || m.exam || "Exam";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="sp-wrap">
      {/* Tab Bar */}
      <div className="sp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`sp-tab${activeTab === t ? " active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="sp-body">
        {loading && <div className="sp-loading"><i className="bx bx-loader-alt bx-spin"></i> Loading...</div>}

        {/*  Attendance  */}
        {!loading && activeTab === "Attendance" && (
          <div>
            {myAttRow ? (
              <>
                <div className="sp-att-summary">
                  {[
                    { label: "Present",      value: myAttRow.prestent ?? myAttRow.present ?? "--", color: "#16a34a" },
                    { label: "Absent",       value: myAttRow.absent      ?? "--", color: "#ef4444" },
                    { label: "Working Days", value: myAttRow.WorkingDays ?? "--", color: "#2D3A8C" },
                    {
                      label: "Percentage",
                      value: myAttRow.percentage != null
                        ? `${Math.round(Number(myAttRow.percentage))}%`
                        : "--",
                      color: "#d97706",
                    },
                  ].map((s, i) => (
                    <div className="sp-att-card" key={i} style={{ borderTop: `3px solid ${s.color}` }}>
                      <div className="sp-att-val" style={{ color: s.color }}>{s.value}</div>
                      <div className="sp-att-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <h4 className="sp-section-title">Absent Dates This Month</h4>
                {absentDates.length === 0 ? (
                  <div className="sp-empty">No absences this month. Great job!</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr><th>#</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {absentDates.map((d, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td style={{ color: "#ef4444", fontWeight: 600 }}>
                              {String(d).slice(0, 10)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="sp-empty">No attendance data available for this month.</div>
            )}
          </div>
        )}

        {/*  Marks  */}
        {!loading && activeTab === "Marks" && (
          <div>
            {marks.length === 0 ? (
              <div className="sp-empty">No marks published yet.</div>
            ) : (
              Object.entries(marksByExam).map(([examName, rows], gi) => (
                <div key={gi} className="sp-marks-group">
                  <h4 className="sp-section-title">{examName}</h4>
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr><th>#</th><th>Subject</th><th>Marks Obtained</th><th>Total Marks</th><th>Pass Marks</th><th>Grade</th><th>Result</th></tr>
                      </thead>
                      <tbody>
                        {rows.map((m, i) => {
                          const passed = m.marksObtained >= (m.passMark || m.passMarks || 0);
                          return (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td><span className="sp-subject-pill">{m.subjectName || m.subject}</span></td>
                              <td style={{ fontWeight: 700, color: passed ? "#16a34a" : "#ef4444" }}>{m.marksObtained ?? "--"}</td>
                              <td>{m.totalMark || m.totalMarks || "--"}</td>
                              <td>{m.passMark || m.passMarks || "--"}</td>
                              <td><span className="sp-grade-pill">{m.grade || "--"}</span></td>
                              <td>
                                <span className={`sp-result-pill ${passed ? "pass" : "fail"}`}>
                                  {passed ? "Pass" : "Fail"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/*  Homework  */}
        {!loading && activeTab === "Homework" && (
          <div>
            {homework.length === 0 ? (
              <div className="sp-empty">No homework assigned.</div>
            ) : (
              <div className="sp-table-wrap">
                <table className="sp-table">
                  <thead>
                    <tr><th>#</th><th>Subject</th><th>Date</th><th>Description</th><th>My Progress</th></tr>
                  </thead>
                  <tbody>
                    {homework.map((hw, i) => (
                      <tr key={hw.id || i}>
                        <td>{i + 1}</td>
                        <td><span className="sp-subject-pill">{hw.subject || hw.subjectName}</span></td>
                        <td>{hw.date}</td>
                        <td>{hw.description}</td>
                        <td>
                          <span className="sp-subject-pill">
                            {hw.progressStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/*  Assignments  */}
        {!loading && activeTab === "Assignments" && (
          <div>
            {assignments.length === 0 ? (
              <div className="sp-empty">No assignments found.</div>
            ) : (
              <div className="sp-table-wrap">
                <table className="sp-table">
                  <thead>
                    <tr><th>#</th><th>Title</th><th>Subject</th><th>Start Date</th><th>End Date</th><th>Availability</th><th>My Progress</th></tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => {
                      const open = String(a.status || "").toLowerCase() === "true"
                        || a.status === 1
                        || a.status === "open"
                        || a.isOpen;
                      const progress = a.progressStatus || "Not Started";
                      return (
                        <tr key={a.id || i}>
                          <td>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{a.title}</td>
                          <td><span className="sp-subject-pill">{a.subjectName || a.subject}</span></td>
                          <td>{a.startDate}</td>
                          <td>{a.endDate}</td>
                          <td>
                            <span className={`sp-result-pill ${open ? "pass" : "fail"}`}>
                              {open ? "Open" : "Closed"}
                            </span>
                          </td>
                          <td>
                            <span className="sp-subject-pill">{progress}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/*  Exams  */}
        {!loading && activeTab === "Exams" && (
          <div>
            {exams.length === 0 && portions.length === 0 ? (
              <div className="sp-empty">No exam data available.</div>
            ) : (
              <>
                {exams.length > 0 && (
                  <>
                    <h4 className="sp-section-title">Exam Types</h4>
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr><th>Exam</th><th>Class</th><th>Total Marks</th><th>Pass Marks</th></tr>
                        </thead>
                        <tbody>
                          {exams.map((ex, i) => (
                            <tr key={i}>
                              <td><span className="sp-exam-pill">{ex.exam}</span></td>
                              <td>{ex.className}</td>
                              <td>{ex.totalMark}</td>
                              <td>{ex.passMark}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                {portions.length > 0 && (
                  <>
                    <h4 className="sp-section-title" style={{ marginTop: 24 }}>Exam Schedule</h4>
                    <div className="sp-table-wrap">
                      <table className="sp-table">
                        <thead>
                          <tr><th>Subject</th><th>Exam</th><th>Date</th><th>Time</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                          {portions.map((p, i) => (
                            <tr key={i}>
                              <td>{p.subject}</td>
                              <td>{p.examName}</td>
                              <td>{p.examDate}</td>
                              <td>{p.examFromTime} – {p.examToTime}</td>
                              <td>{p.totalMarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/*  Timetable  */}
        {!loading && activeTab === "Timetable" && (
          <div>
            {timetable.length === 0 ? (
              <div className="sp-empty">No timetable available.</div>
            ) : (
              <div className="sp-table-wrap">
                <table className="sp-table">
                  <thead>
                    <tr><th>Day</th><th>Period</th><th>Subject</th><th>Teacher</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {timetable.map((row, i) => (
                      <tr key={i}>
                        <td><span className="sp-day-pill">{row.day}</span></td>
                        <td>{row.periodNo || row.period}</td>
                        <td>{row.subjectName || row.subject}</td>
                        <td>{row.staffName || row.teacher || "--"}</td>
                        <td>{row.fromTime} – {row.toTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/*  Events  */}
        {!loading && activeTab === "Events" && (
          <div>
            {events.length === 0 ? (
              <div className="sp-empty">No events found.</div>
            ) : (
              <div className="sp-events-grid">
                {events.map((ev, i) => (
                  <div className="sp-event-card" key={i}>
                    <div className="sp-event-header">
                      <i className="bx bxs-calendar-event"></i>
                      <span>{ev.eventName}</span>
                    </div>
                    <div className="sp-event-body">
                      <p>{ev.content}</p>
                      <div className="sp-event-meta">
                        <span><i className="bx bx-calendar"></i> {ev.fromDate} – {ev.toDate}</span>
                        <span><i className="bx bx-time"></i> {ev.startTime} – {ev.endTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/*  Class Teacher  */}
        {!loading && activeTab === "ClassTeacher" && (
          <div>
            {!classTeacher ? (
              <div className="sp-empty">No class teacher assigned.</div>
            ) : (
              <div className="sp-teacher-card">
                <div className="sp-teacher-avatar">
                  <i className="bx bxs-user-circle"></i>
                </div>
                <div className="sp-teacher-info">
                  <h3>{classTeacher.staffName || classTeacher.teacherName || "Class Teacher"}</h3>
                  <p className="sp-teacher-role">Class Teacher</p>
                  <div className="sp-teacher-meta">
                    {classTeacher.className  && <span><i className="bx bx-building"></i> Class {classTeacher.className}</span>}
                    {classTeacher.sectionName && <span><i className="bx bx-grid"></i> Section {classTeacher.sectionName}</span>}
                    {classTeacher.email       && <span><i className="bx bx-envelope"></i> {classTeacher.email}</span>}
                    {classTeacher.phone       && <span><i className="bx bx-phone"></i> {classTeacher.phone}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  Subject Teachers  */}
        {!loading && activeTab === "SubjectTeachers" && (
          <div>
            {subjectTeachers.length === 0 ? (
              <div className="sp-empty">No subject teachers found.</div>
            ) : (
              <div className="sp-teachers-grid">
                {subjectTeachers.map((t, i) => (
                  <div className="sp-teacher-tile" key={i}>
                    <div className="sp-tile-avatar">
                      <i className="bx bxs-user"></i>
                    </div>
                    <div className="sp-tile-body">
                      <div className="sp-tile-name">{t.staffName || t.teacherName || "Teacher"}</div>
                      <div className="sp-tile-subject">
                        <span className="sp-subject-pill">{t.subjectName || t.subject || "Subject"}</span>
                      </div>
                      {t.email && <div className="sp-tile-meta"><i className="bx bx-envelope"></i> {t.email}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/*  Leave  */}
        {!loading && activeTab === "Leave" && (
          <div>
            {/* Apply Leave Form */}
            <div className="sp-leave-form-wrap">
              <h4 className="sp-section-title">Apply for Leave</h4>
              <form className="sp-leave-form" onSubmit={handleLeaveSubmit}>
                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label>Leave Type</label>
                    <select
                      value={leaveForm.leaveTypeId}
                      onChange={(e) => setLeaveForm(f => ({ ...f, leaveTypeId: e.target.value }))}
                      required
                    >
                      <option value="">Select type</option>
                      {leaveTypes.map((lt, i) => (
                        <option key={i} value={lt.id}>{lt.leaveType || lt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sp-form-group">
                    <label>From Date</label>
                    <input type="date" value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm(f => ({ ...f, startDate: e.target.value }))} required />
                  </div>
                  <div className="sp-form-group">
                    <label>To Date</label>
                    <input type="date" value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm(f => ({ ...f, endDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="sp-form-group sp-form-full">
                  <label>Reason</label>
                  <textarea rows={3} value={leaveForm.reason}
                    onChange={(e) => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="Enter reason for leave..." required />
                </div>
                {leaveMsg && (
                  <div className={`sp-leave-msg ${leaveMsg.includes("success") ? "success" : "error"}`}>
                    {leaveMsg}
                  </div>
                )}
                <button type="submit" className="sp-leave-submit">Apply Leave</button>
              </form>
            </div>

            {/* Leave History */}
            <h4 className="sp-section-title" style={{ marginTop: 28 }}>Leave History</h4>
            {leaves.length === 0 ? (
              <div className="sp-empty">No leave applications found.</div>
            ) : (
              <div className="sp-table-wrap">
                <table className="sp-table">
                  <thead>
                    <tr><th>#</th><th>Leave Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {leaves.map((lv, i) => {
                      const status = lv.status || "pending";
                      // const statusClass = status === "accepted" ? "pass" : status === "rejected" ? "fail" : "pending";
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{lv.leaveType || lv.leaveTypeName || "--"}</td>
                          <td>{lv.startDate || lv.fromDate}</td>
                          <td>{lv.endDate || lv.toDate}</td>
                          <td>{lv.reason}</td>
                          <td><span className={`sp-result-pill ${status}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
