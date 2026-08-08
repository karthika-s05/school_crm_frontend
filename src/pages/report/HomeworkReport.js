import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  exportHomeworkReportCsv,
  getClass,
  getHomeworkReportData,
  getSection,
  getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { downloadCsv, runApi } from "../../utils/apiHelper";
import "./HomeworkReport.css";

const PAGE_SIZE = 10;

const HIDDEN_COLUMNS = new Set([
  "id",
  "classid",
  "sectionid",
  "subjectid",
  "staffid",
  "administrationid",
  "isactive",
]);

const prettifyHeader = (key) =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const isVisibleColumn = (key) => {
  if (!key || String(key).startsWith("_")) return false;
  return !HIDDEN_COLUMNS.has(String(key).toLowerCase());
};

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
  const [page, setPage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");

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
      } catch (_) {
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
        onSuccess: (res) => {
          setRows(res.data || []);
          setPage(1);
        },
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

  const columns = useMemo(() => {
    if (!rows.length) {
      return ["description", "subjectName", "staffName", "createdDate", "className", "sectionName"];
    }
    return Object.keys(rows[0]).filter(isVisibleColumn);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(q)
    );
  }, [rows, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const subjectCount = useMemo(() => {
    const set = new Set(
      rows.map((r) => r.subjectName || r.subject || r.subjectId).filter(Boolean)
    );
    return set.size;
  }, [rows]);

  const staffCount = useMemo(() => {
    const set = new Set(
      rows.map((r) => r.staffName || r.createdBy || r.staffId).filter(Boolean)
    );
    return set.size;
  }, [rows]);

  return (
    <div className="hwr-page">
      <div className="hwr-hero">
        <div>
          {/* <span className="hwr-eyebrow">Reports</span>
          <h1>Homework Report</h1>
          <p>Track homework by class, section, subject and teacher.</p> */}
        </div>
        <button
          type="button"
          className="hwr-btn hwr-btn-outline"
          onClick={handleExport}
          disabled={exporting || rows.length === 0}
        >
          <i className="bx bx-download"></i>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <div className="hwr-stats">
        <div className="hwr-stat">
          <span className="hwr-stat-label">Total</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="hwr-stat">
          <span className="hwr-stat-label">Subjects</span>
          <strong>{subjectCount}</strong>
        </div>
        <div className="hwr-stat">
          <span className="hwr-stat-label">Teachers</span>
          <strong>{staffCount}</strong>
        </div>
        <div className="hwr-stat accent">
          <span className="hwr-stat-label">Showing</span>
          <strong>{filtered.length}</strong>
        </div>
      </div>

      <div className="hwr-filters">
        <label>
          Class
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Section
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>
          Subject
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="grow">
          Filter
          <input
            placeholder="Search homework…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button type="button" className="hwr-btn hwr-btn-primary" onClick={fetchReport}>
          <i className="bx bx-search"></i> Apply
        </button>
      </div>

      {error && <div className="hwr-error">{error}</div>}

      <div className="hwr-card">
        <div className="hwr-toolbar">
          <div className="hwr-search">
            <i className="bx bx-search"></i>
            <input
              placeholder="Search report rows…"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <span className="hwr-pill">
            <i className="bx bx-list-ul"></i> {filtered.length} rows
          </span>
        </div>

        {loading ? (
          <div className="hwr-empty">Loading homework report…</div>
        ) : paged.length === 0 ? (
          <div className="hwr-empty">
            <i className="bx bx-book-open"></i>
            <strong>No homework records found</strong>
            <span>Try another class, section or subject filter.</span>
          </div>
        ) : (
          <div className="hwr-table-wrap">
            <table className="hwr-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{prettifyHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id || i}>
                    {columns.map((col) => (
                      <td key={col}>
                        {row[col] === null || row[col] === undefined || row[col] === ""
                          ? "-"
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="hwr-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
