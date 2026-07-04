import React, { useCallback, useEffect, useState } from "react";
import "../services/services.css";
import {
  exportAttendanceReportCsv,
  getAttendanceDailyReport,
  getAttendanceMonthlyReport,
  getClass,
  getSection,
  getStudentlist,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { downloadCsv, runApi } from "../../utils/apiHelper";

export default function AttendanceReport() {
  const token = getToken();
  const [reportType, setReportType] = useState("daily");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [classList, sectionList, studentRes] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getStudentlist({ userName: 0 }, token),
        ]);
        const classOpts = (classList || []).map((c) => ({ id: c.id, name: c.name }));
        const sectionOpts = (sectionList || []).map((s) => ({ id: s.id, name: s.name }));
        setClasses(classOpts);
        setSections(sectionOpts);
        setStudents(studentRes?.data || []);
        if (classOpts.length) setClassId(String(classOpts[0].id));
        if (sectionOpts.length) setSectionId(String(sectionOpts[0].id));
      } catch (err) {
        setError("Failed to load filters.");
      }
    };
    loadMeta();
  }, [token]);

  const fetchReport = useCallback(async () => {
    if (!classId || !sectionId) return;
    setLoading(true);
    setError(null);
    const fn =
      reportType === "monthly"
        ? () =>
            getAttendanceMonthlyReport(
              {
                studentId: studentId || undefined,
                classId: Number(classId),
                sectionId: Number(sectionId),
                month,
              },
              token
            )
        : () =>
            getAttendanceDailyReport(
              {
                classId: Number(classId),
                sectionId: Number(sectionId),
                date,
              },
              token
            );

    await runApi(fn, {
      onSuccess: (res) => setRows(res.data || []),
      onError: () => setError("Failed to load attendance report."),
    });
    setLoading(false);
  }, [reportType, classId, sectionId, studentId, month, date, token]);

  useEffect(() => {
    if (classId && sectionId) fetchReport();
  }, [fetchReport, classId, sectionId]);

  const handleExport = async () => {
    setExporting(true);
    await runApi(
      () =>
        exportAttendanceReportCsv(
          {
            reportType,
            classId: Number(classId),
            sectionId: Number(sectionId),
            studentId: studentId || undefined,
            month,
            date,
          },
          token
        ),
      {
        successMsg: "Export ready",
        onSuccess: (res) => {
          const { csv, filename } = res.data || {};
          if (csv) downloadCsv(csv, filename || "attendance_report.csv");
        },
      }
    );
    setExporting(false);
  };

  const columns =
    rows.length > 0
      ? Object.keys(rows[0]).filter((k) => !k.startsWith("_"))
      : ["studentName", "date", "status", "present", "absent"];

  return (
    <div className="sdl-wrap" style={{ padding: "24px 28px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Attendance Report</h2>
      <p style={{ color: "#64748b", marginBottom: 20 }}>Class daily and student monthly attendance.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select className="wz-input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="daily">Class Daily</option>
          <option value="monthly">Student Monthly</option>
        </select>
        <select className="wz-input" value={classId} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="wz-input" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {reportType === "monthly" && (
          <>
            <select className="wz-input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">All students</option>
              {students.map((s) => (
                <option key={s.id || s.registrationNo} value={s.id || s.registrationNo}>
                  {s.studentName || s.name}
                </option>
              ))}
            </select>
            <input className="wz-input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </>
        )}
        {reportType === "daily" && (
          <input className="wz-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <button type="button" className="fw-btn-fill btn-gradient-add" onClick={fetchReport}>
          Apply
        </button>
        <button type="button" className="fw-btn-fill" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fef2f2", color: "#ef4444", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        {loading ? (
          <p style={{ padding: 24, color: "#64748b" }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ padding: 24, color: "#64748b" }}>No attendance records for the selected filters.</p>
        ) : (
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={{ textAlign: "left", padding: 12 }}>
                    {col.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map((col) => (
                    <td key={col} style={{ padding: 12 }}>
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
