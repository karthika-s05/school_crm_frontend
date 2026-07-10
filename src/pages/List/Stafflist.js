import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../List/StudentDummyList.css";
import { getStafflist } from "../../services/api";
import { getToken } from "../../services/auth";

const ITEMS_PER_PAGE = 8;
const AV_COLORS = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];
const getInitials = name => name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i,"").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

const mapStaff = (item, index) => ({
  id:           item.id        || index + 1,
  staffId:      item.staffId   || item.staffID   || "-",
  name:         item.staffName || item.name      || "-",
  dept:         item.department|| item.dept      || "-",
  position:     item.position  || item.roleOfStaff || item.role || "-",
  gender:       item.gender    || "-",
  dob:          item.date_of_birth || item.dateOfBirth || item.dob || "-",
  mobile:       item.contact_number || item.mobile || item.phoneNumber || "-",
  email:        item.emailID   || item.email     || "-",
  joined:       item.date_of_joining || item.dateOfJoining || item.joined || "-",
  role:         item.roleOfStaff || item.role    || "Teacher",
  status:       item.status    || "Active",
  address:      item.address   || [item.address1, item.city, item.state].filter(Boolean).join(", ") || "-",
  qualification: item.qualification || "-",
  experience:   item.experience || "-",
});

const ROLES = ["All","Teacher","HOD","Admin","Non-Teaching"];

const DETAIL_FIELDS = [
  ["Staff ID",       "staffId"],
  ["Department",     "dept"],
  ["Position",       "position"],
  ["Role",           "role"],
  ["Gender",         "gender"],
  ["Date of Birth",  "dob"],
  ["Mobile",         "mobile"],
  ["Email",          "email"],
  ["Date of Joining","joined"],
  ["Qualification",  "qualification"],
  ["Experience",     "experience"],
  ["Address",        "address"],
  ["Status",         "status"],
];

export default function StaffList() {
  const navigate = useNavigate();

  const [staff,        setStaff]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [roleFilter,   setRoleFilter]   = useState("All");
  const [selectedStaff,setSelectedStaff]= useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res   = await getStafflist("0", token);

        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setStaff(res.data.map(mapStaff));
        }
      } catch (err) {
        console.error("getStafflist API error:", err);
        setError("No Data Found");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    if (!selectedStaff) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedStaff(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedStaff]);

  const filtered = staff.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) ||
               s.staffId.toLowerCase().includes(search.toLowerCase()) ||
               s.email.toLowerCase().includes(search.toLowerCase()) ||
               s.dept.toLowerCase().includes(search.toLowerCase());
    const mr = roleFilter === "All" || s.role === roleFilter;
    return ms && mr;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const activeCount   = staff.filter(s => s.status === "Active").length;
  const teacherCount  = staff.filter(s => s.role === "Teacher" || s.role === "HOD").length;
  const deptCount     = new Set(staff.map(s => s.dept)).size;

  const selectedColor = selectedStaff
    ? AV_COLORS[(staff.findIndex(s => s.staffId === selectedStaff.staffId) + 1) % AV_COLORS.length]
    : AV_COLORS[0];

  return (
    <div className="sdl-wrap">

      <div className="sdl-header">
        <div className="sdl-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search by name, staff ID, department..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button className="sdl-add-btn" onClick={() => navigate("/admin/staff/new")}>
          <i className="bx bx-plus"></i> Add Staff
        </button>
      </div>

      {error && (
        <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:10, padding:"10px 16px",
          fontSize:13, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>
          <i className="bx bx-error-circle" style={{ fontSize:18 }}></i>
          {error}
        </div>
      )}

      <div className="sdl-filters">
        <div className="sdl-class-tabs">
          {ROLES.map(r => (
            <button key={r} className={`sdl-tab${roleFilter===r?" active":""}`}
              onClick={() => { setRoleFilter(r); setPage(1); }}>
              {r === "All" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="sdl-stats">
        {[
          { label:"Total Staff",    value:staff.length,   icon:"bx bxs-user-badge",    color:"#2D3A8C", bg:"#eef0fb" },
          { label:"Active",         value:activeCount,    icon:"bx bxs-check-circle",  color:"#22c55e", bg:"#f0fdf4" },
          { label:"Teaching Staff", value:teacherCount,   icon:"bx bxs-chalkboard",    color:"#7c3aed", bg:"#f5f3ff" },
          { label:"Departments",    value:deptCount,      icon:"bx bxs-school",         color:"#d97706", bg:"#fef3c7" },
        ].map((s, i) => (
          <div className="sdl-stat-card" key={i}>
            <div className="sdl-stat-icon" style={{ background:s.bg, color:s.color }}>
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
          <div style={{ padding:"60px 0", textAlign:"center", color:"#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize:36, display:"block", marginBottom:10, color:"#2D3A8C" }}></i>
            Loading staff…
          </div>
        ) : (
          <table className="sdl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Staff Member</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>View Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No staff found</span>
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id}>
                  <td className="sdl-num">{(page-1)*ITEMS_PER_PAGE+i+1}</td>
                  <td>
                    <div className="sdl-student-cell">
                      <img className="sdl-avatar" alt={s.name} src={s.image} />
                      <div>
                        <div className="sdl-name">{s.name}</div>
                        <div className="sdl-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="sdl-adm">{s.staffId}</td>
                  <td><span className="sdl-class-badge">{s.dept}</span></td>
                  <td>
                    <span style={{ fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:6,
                      background: s.role==="HOD"?"#eef0fb":s.role==="Admin"?"#fef3c7":s.role==="Non-Teaching"?"#f1f5f9":"#f0fdf4",
                      color:      s.role==="HOD"?"#2D3A8C":s.role==="Admin"?"#d97706":s.role==="Non-Teaching"?"#64748b":"#16a34a"
                    }}>
                      {s.role}
                    </span>
                  </td>
                  <td>
                    <span className={`sdl-status ${(s.status||"active").toLowerCase()}`}>{s.status}</span>
                  </td>
                  <td>
                    <button
                      className="sdl-btn-details"
                      onClick={() => setSelectedStaff(s)}
                    >
                      <i className="bx bx-show"></i> View Details
                    </button>
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
            Showing {(page-1)*ITEMS_PER_PAGE+1}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="sdl-page-btns">
            <button className="sdl-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} className={`sdl-page-btn${page===p?" active":""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="sdl-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {selectedStaff && (
        <div className="sdl-drawer-overlay" onClick={() => setSelectedStaff(null)}>
          <div className="sdl-drawer" onClick={e => e.stopPropagation()}>
            <div className="sdl-drawer-header">
              <h3 className="sdl-drawer-title">Staff Details</h3>
              <button className="sdl-drawer-close" onClick={() => setSelectedStaff(null)} aria-label="Close">
                <i className="bx bx-x"></i>
              </button>
            </div>

            <div className="sdl-drawer-body">
              <div className="sdl-drawer-hero">
                <div className="sdl-avatar" style={{ background: selectedColor }}>
                  {getInitials(selectedStaff.name)}
                </div>
                <div>
                  <p className="sdl-drawer-hero-name">{selectedStaff.name}</p>
                  <p className="sdl-drawer-hero-sub">{selectedStaff.staffId} · {selectedStaff.dept}</p>
                </div>
              </div>

              <div className="sdl-drawer-grid">
                {DETAIL_FIELDS.map(([label, key]) => (
                  <div className="sdl-drawer-row" key={key}>
                    <span className="sdl-drawer-key">{label}</span>
                    <span className="sdl-drawer-val">
                      {key === "status" ? (
                        <span className={`sdl-status ${(selectedStaff.status||"active").toLowerCase()}`}>
                          {selectedStaff[key]}
                        </span>
                      ) : selectedStaff[key] || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sdl-drawer-footer">
              <button className="sdl-drawer-btn sdl-drawer-btn-secondary" onClick={() => setSelectedStaff(null)}>
                Close
              </button>
              <button
                className="sdl-drawer-btn sdl-drawer-btn-primary"
                onClick={() => {
                  const staffId = selectedStaff.staffId;
                  setSelectedStaff(null);
                  navigate(`/stafflist/${staffId}`);
                }}
              >
                <i className="bx bx-edit"></i> Edit Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
