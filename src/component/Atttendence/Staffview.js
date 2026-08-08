import React, { useState, useEffect } from "react";
import "../Atttendence/Attendence.css";
import { useNavigate } from "react-router-dom";

const DUMMY_STAFF = [
  { id:1,  name:"Mr. Suresh Kumar",    dept:"Mathematics",  role:"Teacher",       date:"2025-01-20", status:"Present", inTime:"08:45 AM", outTime:"04:30 PM" },
  { id:2,  name:"Mrs. Kavitha Raj",    dept:"Science",      role:"Teacher",       date:"2025-01-20", status:"Present", inTime:"08:50 AM", outTime:"04:30 PM" },
  { id:3,  name:"Mr. Dinesh Babu",     dept:"English",      role:"Teacher",       date:"2025-01-20", status:"Absent",  inTime:"",        outTime:""        },
  { id:4,  name:"Mrs. Radha Menon",    dept:"Social",       role:"Teacher",       date:"2025-01-20", status:"Present", inTime:"08:40 AM", outTime:"04:30 PM" },
  { id:5,  name:"Mr. Arun Prakash",    dept:"Arts",         role:"Teacher",       date:"2025-01-20", status:"Present", inTime:"09:00 AM", outTime:"04:30 PM" },
  { id:6,  name:"Mrs. Geetha Nair",    dept:"Tamil",        role:"Teacher",       date:"2025-01-20", status:"Leave",   inTime:"",        outTime:""        },
  { id:7,  name:"Mr. Balu Rajan",      dept:"Admin",        role:"Non-Teaching",  date:"2025-01-20", status:"Present", inTime:"08:30 AM", outTime:"05:00 PM" },
  { id:8,  name:"Mrs. Selvi Devi",     dept:"Library",      role:"Non-Teaching",  date:"2025-01-20", status:"Present", inTime:"08:55 AM", outTime:"04:30 PM" },
  { id:9,  name:"Mr. Suresh Kumar",    dept:"Mathematics",  role:"Teacher",       date:"2025-01-21", status:"Present", inTime:"08:42 AM", outTime:"04:30 PM" },
  { id:10, name:"Mrs. Kavitha Raj",    dept:"Science",      role:"Teacher",       date:"2025-01-21", status:"Absent",  inTime:"",        outTime:""        },
  { id:11, name:"Mr. Dinesh Babu",     dept:"English",      role:"Teacher",       date:"2025-01-21", status:"Present", inTime:"08:48 AM", outTime:"04:30 PM" },
  { id:12, name:"Mrs. Radha Menon",    dept:"Social",       role:"Teacher",       date:"2025-01-21", status:"Present", inTime:"08:38 AM", outTime:"04:30 PM" },
];

const PAGE_SIZE = 8;
const avatarColors = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];
const getInitials = n => n.replace("Mr. ","").replace("Mrs. ","").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

export default function Staffview() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [selDate, setSelDate] = useState("");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);

  const filtered = DUMMY_STAFF.filter(r => {
    const matchDate   = !selDate || r.date === selDate;
    const matchSearch = !search  ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);
  const presentCnt = filtered.filter(r => r.status === "Present").length;
  const absentCnt  = filtered.filter(r => r.status === "Absent").length;
  const leaveCnt   = filtered.filter(r => r.status === "Leave").length;

  return (
    <div className="staff-att-wrap">
      {/* Header */}
      <div className="staff-att-header">
        <div>
          <h2 className="staff-att-title">Staff Attendance</h2>
          <p className="staff-att-sub">Daily attendance records for all staff members</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span className="att-pill present"><i className="bx bxs-check-circle"></i>{presentCnt} Present</span>
          <span className="att-pill absent"><i className="bx bxs-x-circle"></i>{absentCnt} Absent</span>
          <span className="att-pill unmarked" style={{background:"#fff8e6",color:"#f59e0b"}}>
            <i className="bx bxs-calendar-x"></i>{leaveCnt} Leave
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="staff-att-filters">
        <div className="view-att-filter-group">
          <label>Date</label>
          <input type="date" value={selDate} onChange={e=>{setSelDate(e.target.value);setPage(1);}} className="att-input" />
        </div>
        <div className="view-att-filter-group" style={{flex:1}}>
          <label>Search</label>
          <div className="att-search-box" style={{maxWidth:"100%"}}>
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Search by name or department..." value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1);}} />
          </div>
        </div>
        <div className="view-att-filter-group" style={{justifyContent:"flex-end"}}>
          <label>&nbsp;</label>
          <button
            className="att-mark-btn present"
            onClick={() => navigate("/studentattendence")}
          >
            <i className="bx bx-plus"></i> Mark Student Attendance
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="staff-att-table-card">
        <table className="staff-att-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Department</th>
              <th>Role</th>
              <th>Date</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th style={{textAlign:"center"}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{textAlign:"center",padding:"40px",color:"#7b8099" }}>
                  <i className="bx bx-search-alt" style={{fontSize:32,display:"block",marginBottom:8,color:"#d1d5e8"}}></i>
                  {selDate ? "No records for selected date" : "Select a date to view records"}
                </td>
              </tr>
            ) : paginated.map((r,i) => (
              <tr key={r.id}>
                <td>
                  <div className="view-att-student-cell">
                    <div className="att-avatar" style={{background:avatarColors[i%avatarColors.length]}}>
                      {getInitials(r.name)}
                    </div>
                    <span className="att-name">{r.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{fontSize:12,background:"#eef0fb",color:"#2D3A8C",padding:"3px 10px",borderRadius:6,fontWeight:600}}>
                    {r.dept}
                  </span>
                </td>
                <td style={{fontSize:12,color:"#6b7280"}}>{r.role}</td>
                <td style={{fontSize:12,color:"#6b7280"}}>{r.date}</td>
                <td style={{fontSize:12,color:"#374151",fontWeight:500}}>{r.inTime}</td>
                <td style={{fontSize:12,color:"#374151",fontWeight:500}}>{r.outTime}</td>
                <td style={{textAlign:"center"}}>
                  <span className={`att-status-badge ${
                    r.status==="Present" ? "present" :
                    r.status==="Absent"  ? "absent"  : "unmarked"
                  }`}
                  style={r.status==="Leave" ? {background:"#fff8e6",color:"#f59e0b"} : {}}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="att-pagination">
          <span className="att-page-info">
            Showing {(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE,filtered.length)} of {filtered.length}
          </span>
          <div className="att-page-btns">
            <button className="att-page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} className={`att-page-btn${page===p?" active":""}`} onClick={()=>setPage(p)}>{p}</button>
            ))}
            <button className="att-page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
