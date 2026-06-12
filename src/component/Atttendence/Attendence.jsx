import React, { useState } from "react";
import "./Attendence.css";
import { ToastContainer, toast } from "react-toastify";

const CLASSES  = ["6", "7", "8", "9", "10"];
const SECTIONS = ["A", "B", "C"];

const ALL_STUDENTS = [
  { id: "KST001", name: "Aarav Sharma"      },
  { id: "KST002", name: "Priya Nair"        },
  { id: "KST003", name: "Rohan Verma"       },
  { id: "KST004", name: "Sneha Patel"       },
  { id: "KST005", name: "Karthik Rajan"     },
  { id: "KST006", name: "Divya Krishnan"    },
  { id: "KST007", name: "Arjun Mehta"       },
  { id: "KST008", name: "Meera Subramaniam" },
  { id: "KST009", name: "Vikram Singh"      },
  { id: "KST010", name: "Ananya Iyer"       },
  { id: "KST011", name: "Rahul Gupta"       },
  { id: "KST012", name: "Lakshmi Devi"      },
];

const avatarColors = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];

const Attendence = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selClass,   setSelClass]   = useState("10");
  const [selSection, setSelSection] = useState("A");
  const [selDate,    setSelDate]    = useState(today);
  const [attendance, setAttendance] = useState({});
  const [submitted,  setSubmitted]  = useState(false);

  const toggle = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const all = {};
    ALL_STUDENTS.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const presentCount = Object.values(attendance).filter(v => v === "P").length;
  const absentCount  = Object.values(attendance).filter(v => v === "A").length;
  const unmarked     = ALL_STUDENTS.length - presentCount - absentCount;

  const handleSubmit = () => {
    if (unmarked > 0) {
      toast.warning(`${unmarked} student(s) not marked yet!`);
      return;
    }
    setSubmitted(true);
    toast.success("Attendance submitted successfully!");
  };

  const getInitials = (name) =>
    name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="att-wrap">
      {/* Header */}
      <div className="att-header">
        <div>
          <h2 className="att-title">Student Attendance</h2>
          <p className="att-sub">Mark daily attendance for your class</p>
        </div>
        <div className="att-summary-pills">
          <span className="att-pill present"><i className="bx bxs-check-circle"></i>{presentCount} Present</span>
          <span className="att-pill absent"><i className="bx bxs-x-circle"></i>{absentCount} Absent</span>
          <span className="att-pill unmarked"><i className="bx bx-time"></i>{unmarked} Unmarked</span>
        </div>
      </div>

      {/* Filters */}
      <div className="att-filters-card">
        <div className="att-filter-group">
          <label>Date</label>
          <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)} className="att-input" />
        </div>
        <div className="att-filter-group">
          <label>Class</label>
          <select value={selClass} onChange={e => setSelClass(e.target.value)} className="att-input">
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="att-filter-group">
          <label>Section</label>
          <select value={selSection} onChange={e => setSelSection(e.target.value)} className="att-input">
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        <div className="att-filter-group" style={{ justifyContent: "flex-end" }}>
          <label>&nbsp;</label>
          <div className="att-mark-all-btns">
            <button className="att-mark-btn present" onClick={() => markAll("P")}>
              <i className="bx bx-check-double"></i> All Present
            </button>
            <button className="att-mark-btn absent" onClick={() => markAll("A")}>
              <i className="bx bx-x"></i> All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="att-progress-bar-wrap">
        <div className="att-progress-bar">
          <div className="att-progress-fill present" style={{ width: `${(presentCount / ALL_STUDENTS.length) * 100}%` }}></div>
          <div className="att-progress-fill absent"  style={{ width: `${(absentCount  / ALL_STUDENTS.length) * 100}%` }}></div>
        </div>
        <span className="att-progress-label">
          {Math.round((presentCount / ALL_STUDENTS.length) * 100)}% attendance marked
        </span>
      </div>

      {/* Table */}
      <div className="att-table-card">
        <table className="att-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Adm. No</th>
              <th style={{ textAlign: "center" }}>Present</th>
              <th style={{ textAlign: "center" }}>Absent</th>
              <th style={{ textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ALL_STUDENTS.map((s, i) => {
              const status = attendance[s.id];
              return (
                <tr key={s.id} className={status === "P" ? "row-present" : status === "A" ? "row-absent" : ""}>
                  <td className="att-num">{i + 1}</td>
                  <td>
                    <div className="att-student-cell">
                      <div className="att-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                        {getInitials(s.name)}
                      </div>
                      <span className="att-name">{s.name}</span>
                    </div>
                  </td>
                  <td className="att-adm">{s.id}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className={`att-toggle-btn present${status === "P" ? " selected" : ""}`}
                      onClick={() => toggle(s.id, "P")}
                    >
                      <i className="bx bx-check"></i>
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className={`att-toggle-btn absent${status === "A" ? " selected" : ""}`}
                      onClick={() => toggle(s.id, "A")}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {status === "P" && <span className="att-status-badge present">Present</span>}
                    {status === "A" && <span className="att-status-badge absent">Absent</span>}
                    {!status      && <span className="att-status-badge unmarked"></span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="att-footer">
        <button className="att-cancel-btn" onClick={() => setAttendance({})}>
          <i className="bx bx-reset"></i> Reset
        </button>
        <button className="att-submit-btn" onClick={handleSubmit} disabled={submitted}>
          <i className="bx bx-send"></i> {submitted ? "Submitted" : "Submit Attendance"}
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={2500} style={{ fontSize: "14px" }} />
    </div>
  );
};

export default Attendence;
