import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./StudentDummyList.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import { getStudentlist } from "../../services/api";
import { getToken } from "../../services/auth";

const ITEMS_PER_PAGE = 8;
const AV_COLORS = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];

const getInitials = (name) => {
  const text = String(name || "?").trim();
  if (!text || text === "-") return "?";
  return text
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const isSuccessResponse = (res) =>
  ["success", "ok"].includes(String(res?.status || "").toLowerCase());

const mapStudent = (item, index) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  const fullName = [item.studentName, item.firstName, item.lastName, item.name]
    .map((v) => (v == null ? "" : String(v).trim()))
    .find(Boolean);

  return {
    id: item.id || index + 1,
    admNo: String(item.admissionNo || item.admNo || item.userName || "-"),
    name: fullName || "-",
    cls: String(item["class"] ?? item.className ?? item.cls ?? "-"),
    section: String(item.section ?? item.sectionName ?? "-"),
    gender: String(item.gender || "-"),
    dob: String(item.dateOfBirth || item.dob || "-"),
    mobile: String(item.mobile || item.stdMobileNo || "-"),
    email: String(item.emailId || item.email || "-"),
    joined: String(item.dateOfJoining || item.joined || "-"),
    status: String(item.status || "Active"),
  };
};

export default function StudentDummyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchIdRef = useRef(0);

  const [students,     setStudents]     = useState([]);
  const [classes,      setClasses]      = useState(["All"]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [filterClass,  setFilterClass]  = useState("All");

  const fetchStudents = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const res = await getStudentlist(
        { userName: 0, classId: 0, sectionId: 0 },
        token
      );

      if (fetchId !== fetchIdRef.current) return;

      const rows = Array.isArray(res?.data) ? res.data : [];
      const mapped = rows
        .map((row, index) => mapStudent(row, index))
        .filter(Boolean);
      console.log("mapped: ",mapped);

      setStudents(mapped);
      setSearch("");
      setFilterClass("All");
      setPage(1);

      const uniqueClasses = [
        "All",
        ...[...new Set(mapped.map((s) => s.cls).filter((c) => c && c !== "-"))].sort(),
      ];
      setClasses(uniqueClasses.length > 1 ? uniqueClasses : ["All"]);
      setError(
        mapped.length === 0 && !isSuccessResponse(res)
          ? res?.message || "Could not load students."
          : null
      );
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      console.error("getStudentlist API error:", err);
      setStudents([]);
      setError("Could not reach server. Please try again.");
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, location.pathname, location.key]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      String(s.name).toLowerCase().includes(q) ||
      String(s.admNo).toLowerCase().includes(q) ||
      String(s.email).toLowerCase().includes(q);
    const matchClass = filterClass === "All" || String(s.cls) === String(filterClass);
    return matchSearch && matchClass;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const activeCount = students.filter((s) => s.status === "Active").length;

  return (
    <div className="sdl-wrap">
      <div className="sdl-header">
        <div className="sdl-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search by name, admission no, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="sdl-add-btn" onClick={() => navigate("/admin/student/new")}>
          <i className="bx bx-plus"></i> Add Student
        </button>
      </div>

      {error && (
        <div style={{
          background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10,
          padding: "10px 16px", fontSize: 13, color: "#92400e",
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        }}>
          <i className="bx bx-error-circle" style={{ fontSize: 18 }}></i>
          {error}
          <button type="button" className="sdl-page-btn" style={{ marginLeft: "auto" }} onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      <div className="sdl-filters">
        <div className="sdl-class-tabs">
          {classes.map((c) => (
            <button
              key={c}
              className={`sdl-tab${filterClass === c ? " active" : ""}`}
              onClick={() => { setFilterClass(c); setPage(1); }}
            >
              {c === "All" ? "All Classes" : `Class ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="sdl-stats">
        {[
          { label: "Total Students", value: students.length, icon: "bx bxs-user", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Active", value: activeCount, icon: "bx bxs-check-circle", color: "#22c55e", bg: "#f0fdf4" },
          { label: "On This Page", value: paginated.length, icon: "bx bx-list-ul", color: "#7c3aed", bg: "#f5f3ff" },
        ].map((s, i) => (
          <div className="sdl-stat-card" key={i}>
            <div className="sdl-stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={s.icon}></i>
            </div>
            <div>
              <div className="sdl-stat-val">{s.value}</div>
              <div className="sdl-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sdl-table-card">
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading students…
          </div>
        ) : (
          <table className="sdl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Adm. No</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>
                      {students.length > 0
                        ? "No students match your search or class filter."
                        : "No students found. Register a new student to get started."}
                    </span>
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr key={s.admNo !== "-" ? s.admNo : `student-${s.id}-${i}`}>
                  <td className="sdl-num">{(safePage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td>
                    <div className="sdl-student-cell">
                      <img className="sdl-avatar" alt={s.name} src={s.image} />
                      <div>
                        <div className="sdl-name">{s.name}</div>
                        <div className="sdl-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="sdl-adm">{s.admNo}</td>
                  <td><span className="sdl-class-badge">{s.cls}</span></td>
                  <td>{s.section}</td>
                  <td>
                    <span className={`sdl-status ${(s.status || "active").toLowerCase()}`}>{s.status}</span>
                  </td>
                  <td>
                    <TableActionMenu
                      onView={() => navigate(`/studentinfo/${s.admNo}`)}
                      onEdit={() => navigate(`/studentlist/${s.admNo}`)}
                      onDelete={() =>
                        navigate(`/releiving/${s.admNo}`, { state: "Student Relieving" })
                      }
                      deleteLabel="Relieve"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="sdl-page-btns">
            <button className="sdl-page-btn" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`sdl-page-btn${safePage === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="sdl-page-btn" disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
