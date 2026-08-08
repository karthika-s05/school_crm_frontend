import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentDummyList.css";
import {
  TableSelectCheckbox,
  TableSelectionToolbar,
} from "../../component/Table/TableSelection";
import useTableSelection from "../../hooks/useTableSelection";
import { getStafflist } from "../../services/api";
import { getToken } from "../../services/auth";
import ModalPortal from "../../component/modals/ModalPortal";

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
  image:        item.image     || null,
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

  const [staff,          setStaff]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState("");
  const [page,           setPage]           = useState(1);
  const [filterRole,    setFilterRole]    = useState("");
  const [filterDept,    setFilterDept]    = useState("");
  const [draftRole,     setDraftRole]     = useState("");
  const [draftDept,     setDraftDept]     = useState("");
  const [allDepts,      setAllDepts]      = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showFilter,    setShowFilter]    = useState(false);

  const openFilter  = () => { setDraftRole(filterRole); setDraftDept(filterDept); setShowFilter(true); };
  const closeFilter = () => setShowFilter(false);
  const applyFilter = () => { setFilterRole(draftRole); setFilterDept(draftDept); setPage(1); setShowFilter(false); };
  const clearFilter = () => { setDraftRole(""); setDraftDept(""); };

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res   = await getStafflist("0", token);

        if (res?.status?.toLowerCase() === "success" && Array.isArray(res.data)) {
          const mapped = res.data.map(mapStaff);
          setStaff(mapped);
          setAllDepts([...new Set(mapped.map(s => s.dept).filter(d => d && d !== "-"))].sort());
        } else if (res?.status?.toLowerCase() === "error") {
          setError(typeof res.data === "string" ? res.data : "Failed to load staff list");
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
    const mr = !filterRole || s.role === filterRole;
    const md = !filterDept || s.dept === filterDept;
    return ms && mr && md;
  });

  const activeFilterCount = (filterRole ? 1 : 0) + (filterDept ? 1 : 0);
  const draftFilterCount  = (draftRole ? 1 : 0) + (draftDept ? 1 : 0);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage-1)*ITEMS_PER_PAGE, safePage*ITEMS_PER_PAGE);

  const selection = useTableSelection({
    rows: paginated,
    getRowId: (row) => row.staffId,
    resetKey: `${staff.length}|${search}|${filterRole}|${filterDept}`,
  });

  const activeCount   = staff.filter(s => s.status === "Active").length;
  const teacherCount  = staff.filter(s => s.role === "Teacher" || s.role === "HOD").length;
  const deptCount     = new Set(staff.map(s => s.dept)).size;

  const selectedColor = selectedStaff
    ? AV_COLORS[(staff.findIndex(s => s.staffId === selectedStaff.staffId) + 1) % AV_COLORS.length]
    : AV_COLORS[0];

  const handleToolbarEdit = () => {
    const staffId = selection.singleSelectedId;
    if (!staffId) return;
    navigate(`/admin/staff/${staffId}`);
  };

  const handleToolbarRelieve = () => {
    if (selection.selectedCount !== 1) {
      toast.info("Please select only one staff member to relieve.");
      return;
    }
    navigate(`/releiving/${selection.singleSelectedId}`, { state: "Staff Relieving" });
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      <div className="sdl-header">
        <div className="sdl-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search by name, staff ID, department..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <i className="bx bx-x sdl-search-clear" onClick={() => { setSearch(""); setPage(1); }} />
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <TableSelectionToolbar
            selectedCount={selection.selectedCount}
            canEdit={selection.canEdit}
            canDelete={selection.canEdit}
            onEdit={handleToolbarEdit}
            onDelete={handleToolbarRelieve}
            onMessage={(msg) => toast.info(msg)}
            deleteLabel="Relieve"
          />
          <button className="sdl-filter-toggle-btn" onClick={openFilter}>
            <i className="bx bx-filter-alt"></i> Filter
            {activeFilterCount > 0 && <span className="sdl-filter-badge">{activeFilterCount}</span>}
          </button>
          <button className="sdl-add-btn" onClick={() => navigate("/admin/staff/new")}>
            <i className="bx bx-plus"></i> Add Staff
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:10, padding:"10px 16px",
          fontSize:13, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>
          <i className="bx bx-error-circle" style={{ fontSize:18 }}></i>
          {error}
        </div>
      )}



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
                <th className="sdl-th-check">
                  <TableSelectCheckbox
                    checked={selection.allPageSelected}
                    indeterminate={selection.somePageSelected}
                    onChange={selection.toggleSelectAll}
                    ariaLabel="Select all staff on this page"
                    disabled={!paginated.length}
                  />
                </th>
                <th>Staff Member</th>
                <th>Staff ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No staff found</span>
                  </td>
                </tr>
              ) : paginated.map((s, i) => {
                const selected = selection.isSelected(s.staffId);
                return (
                <tr key={s.id} className={selected ? "sdl-row-selected" : undefined}>
                  <td className="sdl-td-check">
                    <TableSelectCheckbox
                      checked={selected}
                      onChange={() => selection.toggleRow(s.staffId)}
                      ariaLabel={`Select ${s.name}`}
                    />
                  </td>
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
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showFilter && (
        <ModalPortal>
        <div className="sdl-filter-overlay" onClick={closeFilter}>
          <aside className="sdl-filter-drawer" onClick={e => e.stopPropagation()}>
            <div className="sdl-filter-drawer-header">
              <span><i className="bx bx-filter-alt"></i> Filters</span>
              <button className="sdl-filter-drawer-close" onClick={closeFilter} aria-label="Close"><i className="bx bx-x"></i></button>
            </div>

            <div className="sdl-filter-drawer-body">
              {(draftRole || draftDept) && (
                <div className="sdl-filter-clear-row">
                  <button className="sdl-filter-clear-btn" onClick={clearFilter}>
                    Clear all
                  </button>
                </div>
              )}
              <div className="sdl-filter-section">
                <div className="sdl-filter-section-title">Role</div>
                <select
                  className="sdl-filter-select"
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {ROLES.filter((r) => r !== "All").map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="sdl-filter-section">
                <div className="sdl-filter-section-title">Department</div>
                {allDepts.length === 0 ? (
                  <p className="sdl-filter-empty">No departments</p>
                ) : (
                  <select
                    className="sdl-filter-select"
                    value={draftDept}
                    onChange={(e) => setDraftDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {allDepts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="sdl-filter-drawer-footer">
              <button className="sdl-filter-cancel-btn" onClick={closeFilter}>Cancel</button>
              <button className="sdl-filter-apply-btn" onClick={applyFilter}>Apply</button>
            </div>
          </aside>
        </div>
        </ModalPortal>
      )}

      {!loading && totalPages > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(safePage-1)*ITEMS_PER_PAGE+1}–{Math.min(safePage*ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
        <ModalPortal>
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
                  navigate(`/admin/staff/${staffId}`);
                }}
              >
                <i className="bx bx-edit"></i> Edit Staff
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
