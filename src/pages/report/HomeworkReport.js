import React, { useCallback, useEffect, useState } from "react";
import "../services/services.css";
import {
  exportHomeworkReportCsv,
  getClass,
  getHomeworkReportData,
  getSection,
  getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { downloadCsv, runApi } from "../../utils/apiHelper";

export default function HomeworkReport() {
  const token = getToken();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [classList, sectionList, subjectList] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getSubject(0, token),
        ]);
        const classOpts = (classList || []).map((c) => ({ id: c.id, name: c.name }));
        const sectionOpts = (sectionList || []).map((s) => ({ id: s.id, name: s.name }));
        const subjectOpts = (subjectList || []).map((s) => ({ id: s.id, name: s.name }));
        setClasses(classOpts);
        setSections(sectionOpts);
        setSubjects(subjectOpts);
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
    await runApi(
      () =>
        getHomeworkReportData(
          {
            classId: Number(classId),
            sectionId: Number(sectionId),
            subjectId: subjectId ? Number(subjectId) : undefined,
            search: search || undefined,
          },
          token
        ),
      {
        onSuccess: (res) => setRows(res.data || []),
        onError: () => setError("Failed to load homework report."),
      }
    );
    setLoading(false);
  }, [classId, sectionId, subjectId, search, token]);

  useEffect(() => {
    if (classId && sectionId) fetchReport();
  }, [fetchReport, classId, sectionId]);

  const handleExport = async () => {
    setExporting(true);
    await runApi(
      () =>
        exportHomeworkReportCsv(
          {
            classId: Number(classId),
            sectionId: Number(sectionId),
            subjectId: subjectId ? Number(subjectId) : undefined,
            search: search || undefined,
          },
          token
        ),
      {
        successMsg: "Export ready",
        onSuccess: (res) => {
          const { csv, filename } = res.data || {};
          if (csv) downloadCsv(csv, filename || "homework_report.csv");
        },
      }
    );
    setExporting(false);
  };

  const columns =
    rows.length > 0
      ? Object.keys(rows[0])
      : ["description", "subjectName", "staffName", "createdDate", "className", "sectionName"];

  return (
    <div className="sdl-wrap" style={{ padding: "24px 28px" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Homework Report</h2>
      <p style={{ color: "#64748b", marginBottom: 20 }}>Homework assigned by class, section, and subject.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
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
        <select className="wz-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          className="wz-input"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
          <p style={{ padding: 24, color: "#64748b" }}>No homework records found.</p>
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
