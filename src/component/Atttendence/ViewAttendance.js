import React, { useState, useEffect, useCallback } from "react";
import "../Atttendence/Attendence.css";
import { getViewAttendance, getClass, getSection } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const PAGE_SIZE = 8;
const avatarColors = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
const getInitials = (n) => (n || "").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

export default function ViewAttendance() {
  const token = getToken();
  const today = new Date().toISOString().split("T")[0];

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [selDate, setSelDate] = useState(today);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load class & section dropdowns
  useEffect(() => {
    if (!token) return;
    const loadMeta = async () => {
      try {
        const [cls, sec] = await Promise.all([getClass(0, token), getSection(0, token)]);
        const cList = Array.isArray(cls) ? cls : [];
        const sList = Array.isArray(sec) ? sec : [];
        setClasses(cList);
        setSections(sList);
        if (cList[0]) setClassId(String(cList[0].id));
        if (sList[0]) setSectionId(String(sList[0].id));
      } catch {
        setClasses([]);
        setSections([]);
      }
    };
    loadMeta();
  }, [token]);

  const loadAttendance = useCallback(async () => {
    if (!classId || !sectionId || !selDate || !token) return;
    setLoading(true);
    await runApi(
      () => getViewAttendance({ classId: Number(classId), sectionId: Number(sectionId), date: selDate }, token),
      {
        onSuccess: (res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setRecords(
            list.map((r) => ({
              id: r.id,
              student: r.studentName || `${r.firstName || ""} ${r.lastName || ""}`.trim(),
              admNo: r.admissionNo || r.studentId || "-",
              className: r.className || "-",
              sectionName: r.sectionName || "-",
              date: r.date || selDate,
              status: r.status === true || r.status === 1 || r.status === "Present" ? "Present" : "Absent",
            }))
          );
        },
        onError: () => setRecords([]),
      }
    );
    setLoading(false);
  }, [classId, sectionId, selDate, token]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const filtered = records.filter((r) =>
    !search ||
    r.student.toLowerCase().includes(search.toLowerCase()) ||
    r.admNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const presentCnt = filtered.filter((r) => r.status === "Present").length;
  const absentCnt = filtered.filter((r) => r.status === "Absent").length;

  return (
    <div className="view-att-wrap">
      <div className="view-att-header">
        <div>
          <h2 className="view-att-title">View Attendance</h2>
          <p className="view-att-sub">Browse and filter student attendance records</p>
        </div>
        <div className="att-summary-pills">
          <span className="att-pill present"><i className="bx bxs-check-circle"></i>{presentCnt} Present</span>
          <span className="att-pill absent"><i className="bx bxs-x-circle"></i>{absentCnt} Absent</span>
          <span className="att-pill unmarked"><i className="bx bx-list-ul"></i>{filtered.length} Total</span>
        </div>
      </div>

      <div className="view-att-filters">
        <div className="view-att-filter-group">
          <label>Date</label>
          <input type="date" value={selDate} onChange={(e) => { setSelDate(e.target.value); setPage(1); }} className="att-input" />
        </div>
        <div className="view-att-filter-group">
          <label>Class</label>
          <select value={classId} onChange={(e) => { setClassId(e.target.value); setPage(1); }} className="att-input">
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.className}</option>
            ))}
          </select>
        </div>
        <div className="view-att-filter-group">
          <label>Section</label>
          <select value={sectionId} onChange={(e) => { setSectionId(e.target.value); setPage(1); }} className="att-input">
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>
            ))}
          </select>
        </div>
        <div className="view-att-filter-group" style={{ flex: 1 }}>
          <label>Search</label>
          <div className="att-search-box" style={{ maxWidth: "100%" }}>
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Search student or adm. no..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className="view-att-table-card">
        {loading ? (
          <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading attendance…
          </div>
        ) : (
          <table className="view-att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Adm. No</th>
                <th>Class</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="att-num" style={{ textAlign: "center", padding: "40px", color: "#7b8099" }}>
                    <i className="bx bx-search-alt" style={{ fontSize: 32, display: "block", marginBottom: 8, color: "#d1d5e8" }}></i>
                    No records found
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => (
                  <tr key={r.id ?? i}>
                    <td className="att-num">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <div className="view-att-student-cell">
                        <div className="att-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                          {getInitials(r.student)}
                        </div>
                        <span className="att-name">{r.student}</span>
                      </div>
                    </td>
                    <td className="att-adm">{r.admNo}</td>
                    <td>
                      <span className="view-att-class-badge">
                        {r.className}{r.sectionName && r.sectionName !== "-" ? `-${r.sectionName}` : ""}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{r.date}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`att-status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="att-pagination">
          <span className="att-page-info">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="att-page-btns">
            <button className="att-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`att-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="att-page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
