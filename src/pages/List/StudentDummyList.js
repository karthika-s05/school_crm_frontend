import React, { useState } from "react";
import "./StudentDummyList.css";

const dummyStudents = [
  { id: 1,  admNo: "KST2024001", name: "Aarav Sharma",      class: "10", section: "A", gender: "Male",   dob: "12-Mar-2010", mobile: "9876543210", email: "aarav@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 2,  admNo: "KST2024002", name: "Priya Nair",        class: "9",  section: "B", gender: "Female", dob: "05-Jul-2011",  mobile: "9876543211", email: "priya@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 3,  admNo: "KST2024003", name: "Rohan Verma",       class: "8",  section: "A", gender: "Male",   dob: "22-Jan-2012",  mobile: "9876543212", email: "rohan@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 4,  admNo: "KST2024004", name: "Sneha Patel",       class: "10", section: "B", gender: "Female", dob: "18-Sep-2010",  mobile: "9876543213", email: "sneha@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 5,  admNo: "KST2024005", name: "Karthik Rajan",     class: "7",  section: "C", gender: "Male",   dob: "30-Nov-2013",  mobile: "9876543214", email: "karthik@mail.com", joined: "01-Jun-2024", status: "Inactive" },
  { id: 6,  admNo: "KST2024006", name: "Divya Krishnan",    class: "9",  section: "A", gender: "Female", dob: "14-Feb-2011",  mobile: "9876543215", email: "divya@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 7,  admNo: "KST2024007", name: "Arjun Mehta",       class: "6",  section: "B", gender: "Male",   dob: "08-Aug-2014",  mobile: "9876543216", email: "arjun@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 8,  admNo: "KST2024008", name: "Meera Subramaniam", class: "8",  section: "C", gender: "Female", dob: "25-Apr-2012",  mobile: "9876543217", email: "meera@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 9,  admNo: "KST2024009", name: "Vikram Singh",      class: "10", section: "C", gender: "Male",   dob: "03-Dec-2010",  mobile: "9876543218", email: "vikram@mail.com",  joined: "01-Jun-2024", status: "Active"   },
  { id: 10, admNo: "KST2024010", name: "Ananya Iyer",       class: "7",  section: "A", gender: "Female", dob: "17-Jun-2013",  mobile: "9876543219", email: "ananya@mail.com",  joined: "01-Jun-2024", status: "Inactive" },
  { id: 11, admNo: "KST2024011", name: "Rahul Gupta",       class: "9",  section: "C", gender: "Male",   dob: "11-Oct-2011",  mobile: "9876543220", email: "rahul@mail.com",   joined: "01-Jun-2024", status: "Active"   },
  { id: 12, admNo: "KST2024012", name: "Lakshmi Devi",      class: "6",  section: "A", gender: "Female", dob: "29-May-2014",  mobile: "9876543221", email: "lakshmi@mail.com", joined: "01-Jun-2024", status: "Active"   },
];

const ITEMS_PER_PAGE = 8;

const avatarColors = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];

const StudentDummyList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterClass, setFilterClass] = useState("All");

  const classes = ["All", "6", "7", "8", "9", "10"];

  const filtered = dummyStudents.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admNo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "All" || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getInitials = (name) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="sdl-wrap">
      {/* Header */}
      <div className="sdl-header">
        <div>
          <h2 className="sdl-title">Student List</h2>
          <p className="sdl-sub">Total <strong>{filtered.length}</strong> students found</p>
        </div>
        <button className="sdl-add-btn">
          <i className="bx bx-plus"></i> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="sdl-filters">
        <div className="sdl-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search by name, admission no, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="sdl-class-tabs">
          {classes.map(c => (
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

      {/* Stats row */}
      <div className="sdl-stats">
        {[
          { label: "Total Students", value: dummyStudents.length, icon: "bx bxs-group",          color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Active",         value: dummyStudents.filter(s => s.status === "Active").length,   icon: "bx bxs-check-circle", color: "#22c55e", bg: "#f0fdf4" },
          { label: "Inactive",       value: dummyStudents.filter(s => s.status === "Inactive").length, icon: "bx bxs-x-circle",     color: "#E8541A", bg: "#fdf0eb" },
          { label: "Classes",        value: 5,                                                          icon: "bx bxs-school",       color: "#8b5cf6", bg: "#f5f3ff" },
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

      {/* Table */}
      <div className="sdl-table-card">
        <table className="sdl-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Adm. No</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Mobile</th>
              <th>Date of Birth</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="sdl-empty">
                  <i className="bx bx-search-alt"></i>
                  <span>No students found</span>
                </td>
              </tr>
            ) : (
              paginated.map((s, i) => (
                <tr key={s.id}>
                  <td className="sdl-num">{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td>
                    <div className="sdl-student-cell">
                      <div
                        className="sdl-avatar"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div className="sdl-name">{s.name}</div>
                        <div className="sdl-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="sdl-adm">{s.admNo}</td>
                  <td>
                    <span className="sdl-class-badge">{s.class} - {s.section}</span>
                  </td>
                  <td>
                    <span className={`sdl-gender ${s.gender.toLowerCase()}`}>{s.gender}</span>
                  </td>
                  <td className="sdl-mobile">{s.mobile}</td>
                  <td className="sdl-dob">{s.dob}</td>
                  <td className="sdl-dob">{s.joined}</td>
                  <td>
                    <span className={`sdl-status ${s.status.toLowerCase()}`}>{s.status}</span>
                  </td>
                  <td>
                    <div className="sdl-actions">
                      <button className="sdl-btn-view" title="View"><i className="bx bx-show"></i></button>
                      <button className="sdl-btn-edit" title="Edit"><i className="bx bx-edit"></i></button>
                      <button className="sdl-btn-del"  title="Delete"><i className="bx bx-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="sdl-page-btns">
            <button
              className="sdl-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`sdl-page-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="sdl-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDummyList;
