import React, { useCallback, useEffect, useState } from "react";
import "../../component/modules.css";
import {
  exportAttendanceReportCsv, getAttendanceDailyReport,
  getAttendanceMonthlyReport, getClass, getSection, getStudentlist,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { downloadCsv, runApi } from "../../utils/apiHelper";

export default function AttendanceReport() {
  const token = getToken();
  const [reportType, setReportType] = useState("daily");
  const [classes,    setClasses]    = useState([]);
  const [sections,   setSections]   = useState([]);
  const [students,   setStudents]   = useState([]);
  const [classId,    setClassId]    = useState("");
  const [sectionId,  setSectionId]  = useState("");
  const [studentId,  setStudentId]  = useState("");
  const [month,      setMonth]      = useState(new Date().toISOString().slice(0, 7));
  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const PAGE = 10;

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec, stuRes] = await Promise.all([
          getClass(0, token), getSection(0, token),
          getStudentlist({ userName: 0 }, token),
        ]);
        const classOpts   = (cls || []).map(c => ({ id: c.id, name: c.name }));
        const sectionOpts = (sec || []).map(s => ({ id: s.id, name: s.name }));
        setClasses(classOpts);
        setSections(sectionOpts);
        setStudents(stuRes?.data || []);
        if (classOpts[0])   setClassId(String(classOpts[0].id));
        if (sectionOpts[0]) setSectionId(String(sectionOpts[0].id));
      } catch {}
    };
    loadMeta();
  }, [token]);

  const fetchReport = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    const fn = reportType === "monthly"
      ? () => getAttendanceMonthlyReport({ studentId: studentId || undefined, classId: Number(classId), sectionId: Number(sectionId), month }, token)
      : () => getAttendanceDailyReport({ classId: Number(classId), sectionId: Number(sectionId), date }, token);
    await runApi(fn, { onSuccess: (res) => setRows(res.data || []) });
    setLoading(false);
    setPage(1);
  }, [reportType, classId, sectionId, studentId, month, date, token]);

  useEffect(() => { if (classId && sectionId) fetchReport(); }, [fetchReport, classId, sectionId]);

  const handleExport = async () => {
    setExporting(true);
    await runApi(
      () => exportAttendanceReportCsv({ reportType, classId: Number(classId), sectionId: Number(sectionId), studentId: studentId || undefined, month, date }, token),
      { successMsg: "Export ready", onSuccess: (res) => { const { csv, filename } = res.data || {}; if (csv) downloadCsv(csv, filename || "attendance_report.csv"); } }
    );
    setExporting(false);
  };

  const columns = rows.length > 0
    ? Object.keys(rows[0]).filter((k) => {
        if (k.startsWith("_")) return false;
        const key = String(k).toLowerCase();
        return !["classid", "sectionid", "periodslotid", "periodid", "slotid", "id"].includes(key);
      })
    : ["studentName", "date", "status"];

  const filtered = rows.filter(r =>
    Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const presentCount = rows.filter(r => r.status === "Present" || r.status === true || r.present === true).length;
  const absentCount  = rows.filter(r => r.status === "Absent"  || r.status === false || r.absent === true).length;

  return (
    <div className="mod-wrap">
      {/* Header */}
      <div className="mod-header">
        <div>
          {/* <h2 className="mod-title">Attendance Report</h2>
          <p className="mod-sub">Class daily and student monthly attendance records</p> */}
        </div>
        <div className="mod-pills">
          <span className="mod-pill green"><i className="bx bxs-user-check"></i>{presentCount} Present</span>
          <span className="mod-pill orange"><i className="bx bxs-user-x"></i>{absentCount} Absent</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mod-filter-card">
        <div className="mod-filter-group">
          <label>Report Type</label>
          <select className="mod-input" value={reportType} onChange={e => setReportType(e.target.value)}>
            <option value="daily">Class Daily</option>
            <option value="monthly">Student Monthly</option>
          </select>
        </div>
        <div className="mod-filter-group">
          <label>Class</label>
          <select className="mod-input" value={classId} onChange={e => setClassId(e.target.value)}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="mod-filter-group">
          <label>Section</label>
          <select className="mod-input" value={sectionId} onChange={e => setSectionId(e.target.value)}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {reportType === "monthly" && (
          <>
            <div className="mod-filter-group">
              <label>Student</label>
              <select className="mod-input" value={studentId} onChange={e => setStudentId(e.target.value)}>
                <option value="">All Students</option>
                {students.map(s => <option key={s.id || s.registrationNo} value={s.id || s.registrationNo}>{s.studentName || s.name}</option>)}
              </select>
            </div>
            <div className="mod-filter-group">
              <label>Month</label>
              <input type="month" className="mod-input" value={month} onChange={e => setMonth(e.target.value)} />
            </div>
          </>
        )}
        {reportType === "daily" && (
          <div className="mod-filter-group">
            <label>Date</label>
            <input type="date" className="mod-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        )}
        <button className="mod-btn mod-btn-primary" onClick={fetchReport}><i className="bx bx-search"></i> Apply</button>
        <button className="mod-btn mod-btn-outline" onClick={handleExport} disabled={exporting}>
          <i className="bx bx-download"></i> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Table */}
      <div className="mod-table-card">
        <div className="mod-table-toolbar">
          <div className="mod-search">
            <i className="bx bx-search"></i>
            <input placeholder="Search records..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span className="mod-pill blue">{filtered.length} records</span>
        </div>

        {loading ? (
          <div className="mod-loading"><div className="mod-spinner"></div> Loading report...</div>
        ) : paged.length === 0 ? (
          <div className="mod-empty"><i className="bx bx-calendar-x"></i><p>No attendance records found</p></div>
        ) : (
          <table className="mod-table">
            <thead>
              <tr>
                <th>#</th>
                {columns.map(col => (
                  <th key={col}>{col.replace(/([A-Z])/g, " $1").trim()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr key={row.id || i}>
                  <td>{(page - 1) * PAGE + i + 1}</td>
                  {columns.map(col => {
                    const val = row[col];
                    const isStatus = col.toLowerCase() === "status";
                    if (isStatus) {
                      const isPresent = val === "Present" || val === true || val === 1;
                      return (
                        <td key={col}>
                          <span className={`mod-badge ${isPresent ? "mod-badge-green" : "mod-badge-red"}`}>
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </td>
                      );
                    }
                    return <td key={col}>{val ?? "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="mod-pagination">
            <span className="mod-page-info">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}</span>
            <div className="mod-page-btns">
              <button className="mod-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="bx bx-chevron-left"></i></button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} className={`mod-page-btn${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="mod-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><i className="bx bx-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
