import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./attendance.css";
import {
  exportAttendanceReportV2,
  getAttendanceReportV2,
  getClass,
  getSection,
  getStafflist,
  getStudentlist,
  getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi, downloadCsv } from "../../utils/apiHelper";
import { currentMonthISO, normalizeStatus, todayISO } from "./constants";
import StatusBadge from "./components/StatusBadge";
import Pagination from "./components/Pagination";
import { LoadingState, EmptyState, ErrorState } from "./components/AttendanceStates";
import { AttendanceFilterBar, FilterGroup, FilterSelect, SearchBox, toOptions } from "./components/AttendanceFilterBar";

const PAGE_SIZE = 10;

// Which filters each report type needs
const REPORT_TYPES = [
  { id: "student",         label: "Student-wise",    icon: "bx bx-user",          filters: ["class", "section", "student", "range"] },
  { id: "staff",           label: "Staff-wise",      icon: "bx bx-id-card",       filters: ["staff", "range"] },
  { id: "daily",           label: "Daily (Class)",   icon: "bx bx-calendar-check", filters: ["class", "section", "date"] },
  { id: "monthly",         label: "Monthly",         icon: "bx bx-calendar",      filters: ["class", "section", "month"] },
  { id: "class",           label: "Class-wise",      icon: "bx bx-buildings",     filters: ["range"] },
  { id: "subject",         label: "Subject-wise",    icon: "bx bx-book",          filters: ["class", "section", "subject", "month"] },
  { id: "absent_students", label: "Absent Students", icon: "bx bx-user-x",        filters: ["class", "section", "date"] },
  { id: "absent_staff",    label: "Absent Staff",    icon: "bx bx-user-minus",    filters: ["date"] },
];

const EXPORT_FORMATS = [
  { id: "csv",  label: "CSV",  icon: "bx bx-file" },
  { id: "xlsx", label: "XLSX", icon: "bx bxs-file-export" },
  { id: "pdf",  label: "PDF",  icon: "bx bxs-file-pdf" },
];

const prettifyHeader = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const HIDDEN_COLUMNS = new Set([
  "classid",
  "sectionid",
  "periodslotid",
  "periodid",
  "slotid",
  "id",
]);

const isVisibleColumn = (key) => {
  if (!key || key.startsWith("_")) return false;
  return !HIDDEN_COLUMNS.has(String(key).toLowerCase());
};

/** Admin: expanded attendance report dashboard with 8 report types + export. */
const AttendanceReportDashboard = () => {
  const token = getToken();

  const [reportType, setReportType] = useState("daily");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [month, setMonth] = useState(currentMonthISO());
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const activeType = REPORT_TYPES.find((t) => t.id === reportType) || REPORT_TYPES[0];
  const needs = (f) => activeType.filters.includes(f);

  useEffect(() => {
    if (!token) return;
    const loadMeta = async () => {
      try {
        const [cls, sec, sub, staffRes] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getSubject(0, token),
          getStafflist("0", token),
        ]);
        setClasses(toOptions(cls, ["name", "className"]));
        setSections(toOptions(sec, ["name", "sectionName"]));
        setSubjects(toOptions(sub, ["name", "subjectName"]));
        setStaffList(
          (Array.isArray(staffRes?.data) ? staffRes.data : []).map((s) => ({
            id: s.staffId ?? s.id,
            name: s.staffName || s.name || String(s.staffId),
          }))
        );
      } catch {
        toast.error("Failed to load filter options");
      }
    };
    loadMeta();
  }, [token]);

  // Student options depend on class/section
  useEffect(() => {
    if (!token || !needs("student") || !classId || !sectionId) {
      setStudents([]);
      setStudentId("");
      return;
    }
    getStudentlist({ classId: Number(classId), sectionId: Number(sectionId) }, token)
      .then((res) =>
        setStudents(
          (res?.data || []).map((s) => ({
            id: s.studentId ?? s.admissionNo ?? s.id,
            name: s.studentName || `${s.firstName || ""} ${s.lastName || ""}`.trim(),
          }))
        )
      )
      .catch(() => setStudents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, reportType, classId, sectionId]);

  const buildBody = useCallback(() => {
    return {
      reportType,
      classId: needs("class") && classId ? Number(classId) : undefined,
      sectionId: needs("section") && sectionId ? Number(sectionId) : undefined,
      subjectId: needs("subject") && subjectId ? Number(subjectId) : undefined,
      studentId: needs("student") && studentId ? studentId : undefined,
      staffId: needs("staff") && staffId ? staffId : undefined,
      date: needs("date") ? date : undefined,
      month: needs("month") ? month : undefined,
      startDate: needs("range") ? fromDate : undefined,
      endDate: needs("range") ? toDate : undefined,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, classId, sectionId, subjectId, studentId, staffId, date, month, fromDate, toDate]);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    await runApi(() => getAttendanceReportV2(reportType, buildBody(), token), {
      onSuccess: (res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.rows || [];
        setRows(list);
        setPage(1);
      },
      onError: () => {
        setRows([]);
        setError("Could not load the report.");
      },
    });
    setLoading(false);
  }, [token, reportType, buildBody]);

  useEffect(() => {
    fetchReport();
    // refetch when type changes; filter changes apply via the Apply button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await exportAttendanceReportV2({ ...buildBody(), format }, token);
      const blob = response.data;
      const disposition = response.headers?.["content-disposition"] || "";
      const nameMatch = disposition.match(/filename="?([^";]+)"?/);
      const fallback = `attendance_${reportType}_report.${format}`;
      if (blob.type && blob.type.includes("application/json")) {
        // Backend answered with JSON (e.g. { data: { csv, filename } })
        const parsed = JSON.parse(await blob.text());
        const csv = parsed?.data?.csv || parsed?.csv;
        if (csv) {
          downloadCsv(csv, parsed?.data?.filename || parsed?.filename || fallback);
          toast.success("Export ready");
        } else {
          toast.error(parsed?.message || "Export failed");
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nameMatch ? nameMatch[1] : fallback;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export ready");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Export failed");
    }
    setExporting("");
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]).filter(isVisibleColumn) : [];
  const filtered = rows.filter((r) =>
    Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="av2-wrap av2-report">
      <div className="av2-report-hero">
        <div className="av2-report-hero-text">
          {/* <span className="av2-report-eyebrow">Analytics</span>
          <h2 className="av2-title">Attendance Reports</h2>
          <p className="av2-sub">
            {activeType.label} · filter, search and export class attendance insights
          </p> */}
        </div>
        <div className="av2-report-exports">
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="av2-btn av2-btn-outline av2-btn-sm"
              onClick={() => handleExport(f.id)}
              disabled={!!exporting || rows.length === 0}
            >
              <i className={f.icon}></i> {exporting === f.id ? "…" : f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="av2-report-tabs" role="tablist" aria-label="Report type">
        {REPORT_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={reportType === t.id}
            className={`av2-report-tab${reportType === t.id ? " active" : ""}`}
            onClick={() => setReportType(t.id)}
          >
            <i className={t.icon}></i>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AttendanceFilterBar>
        {needs("class") && (
          <FilterGroup label="Class">
            <FilterSelect value={classId} onChange={setClassId} options={classes} placeholder="All classes" />
          </FilterGroup>
        )}
        {needs("section") && (
          <FilterGroup label="Section">
            <FilterSelect value={sectionId} onChange={setSectionId} options={sections} placeholder="All sections" />
          </FilterGroup>
        )}
        {needs("subject") && (
          <FilterGroup label="Subject">
            <FilterSelect value={subjectId} onChange={setSubjectId} options={subjects} placeholder="All subjects" />
          </FilterGroup>
        )}
        {needs("student") && (
          <FilterGroup label="Student">
            <FilterSelect
              value={studentId}
              onChange={setStudentId}
              options={students}
              placeholder="All students"
              disabled={!classId || !sectionId}
            />
          </FilterGroup>
        )}
        {needs("staff") && (
          <FilterGroup label="Staff Member">
            <FilterSelect value={staffId} onChange={setStaffId} options={staffList} placeholder="All staff" />
          </FilterGroup>
        )}
        {needs("date") && (
          <FilterGroup label="Date">
            <input type="date" className="av2-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </FilterGroup>
        )}
        {needs("month") && (
          <FilterGroup label="Month">
            <input type="month" className="av2-input" value={month} onChange={(e) => setMonth(e.target.value)} />
          </FilterGroup>
        )}
        {needs("range") && (
          <>
            <FilterGroup label="From">
              <input type="date" className="av2-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </FilterGroup>
            <FilterGroup label="To">
              <input type="date" className="av2-input" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
            </FilterGroup>
          </>
        )}
        <button type="button" className="av2-btn av2-btn-primary av2-btn-sm" onClick={fetchReport}>
          <i className="bx bx-search"></i> Apply
        </button>
      </AttendanceFilterBar>

      <div className="av2-table-card av2-report-table">
        <div className="av2-table-toolbar">
          <div className="av2-report-search">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search report rows…" />
          </div>
          <span className="av2-pill av2-report-count">
            <i className="bx bx-list-ul"></i> {filtered.length} rows
          </span>
        </div>

        {loading ? (
          <LoadingState text="Loading report…" />
        ) : error ? (
          <ErrorState text={error} onRetry={fetchReport} />
        ) : paged.length === 0 ? (
          <EmptyState text="No report data for the selected filters" icon="bx bx-bar-chart-alt-2" />
        ) : (
          <div className="av2-table-scroll">
            <table className="av2-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  {columns.map((col) => (
                    <th key={col}>{prettifyHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id || i}>
                    <td className="av2-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    {columns.map((col) => {
                      const val = row[col];
                      if (col.toLowerCase() === "status") {
                        return (
                          <td key={col} style={{ textAlign: "center" }}>
                            <StatusBadge status={normalizeStatus(val)} />
                          </td>
                        );
                      }
                      return <td key={col}>{val === null || val === undefined || val === "" ? "-" : String(val)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />
    </div>
  );
};

export default AttendanceReportDashboard;
