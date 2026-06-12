import React, { useState } from "react";
import "../Atttendence/Attendence.css";

const DUMMY_RECORDS = [
  { id:1,  student:"Aarav Sharma",      admNo:"KST001", class:"10-A", date:"2025-01-20", status:"Present" },
  { id:2,  student:"Priya Nair",        admNo:"KST002", class:"10-A", date:"2025-01-20", status:"Absent"  },
  { id:3,  student:"Rohan Verma",       admNo:"KST003", class:"10-A", date:"2025-01-20", status:"Present" },
  { id:4,  student:"Sneha Patel",       admNo:"KST004", class:"10-A", date:"2025-01-20", status:"Present" },
  { id:5,  student:"Karthik Rajan",     admNo:"KST005", class:"10-A", date:"2025-01-20", status:"Absent"  },
  { id:6,  student:"Divya Krishnan",    admNo:"KST006", class:"10-A", date:"2025-01-20", status:"Present" },
  { id:7,  student:"Arjun Mehta",       admNo:"KST007", class:"9-B",  date:"2025-01-20", status:"Present" },
  { id:8,  student:"Meera Subramaniam", admNo:"KST008", class:"9-B",  date:"2025-01-20", status:"Present" },
  { id:9,  student:"Vikram Singh",      admNo:"KST009", class:"9-B",  date:"2025-01-20", status:"Absent"  },
  { id:10, student:"Ananya Iyer",       admNo:"KST010", class:"9-B",  date:"2025-01-20", status:"Present" },
  { id:11, student:"Rahul Gupta",       admNo:"KST011", class:"8-C",  date:"2025-01-21", status:"Present" },
  { id:12, student:"Lakshmi Devi",      admNo:"KST012", class:"8-C",  date:"2025-01-21", status:"Present" },
  { id:13, student:"Aarav Sharma",      admNo:"KST001", class:"10-A", date:"2025-01-21", status:"Present" },
  { id:14, student:"Priya Nair",        admNo:"KST002", class:"10-A", date:"2025-01-21", status:"Present" },
  { id:15, student:"Rohan Verma",       admNo:"KST003", class:"10-A", date:"2025-01-21", status:"Absent"  },
];

const CLASSES   = ["All","10-A","9-B","8-C"];
const PAGE_SIZE = 8;
const avatarColors = ["#2D3A8C","#E8541A","#22c55e","#8b5cf6","#f59e0b","#06b6d4"];
const getInitials = n => n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

export default function ViewAttendance() {
  const today = new Date().toISOString().split("T")[0];
  const [selDate,  setSelDate]  = useState("");
  const [selClass, setSelClass] = useState("All");
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  const filtered = DUMMY_RECORDS.filter(r => {
    const matchDate  = !selDate  || r.date === selDate;
    const matchClass = selClass === "All" || r.class === selClass;
    const matchSearch = !search  ||
      r.student.toLowerCase().includes(search.toLowerCase()) ||
      r.admNo.toLowerCase().includes(search.toLowerCase());
    return matchDate && matchClass && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const presentCnt = filtered.filter(r => r.status === "Present").length;
  const absentCnt  = filtered.filter(r => r.status === "Absent").length;

  return (
    <div className="view-att-wrap">
      {/* Header */}
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

      {/* Filters */}
      <div className="view-att-filters">
        <div className="view-att-filter-group">
          <label>Date</label>
          <input type="date" value={selDate} onChange={e=>{setSelDate(e.target.value);setPage(1);}} className="att-input" />
        </div>
        <div className="view-att-filter-group">
          <label>Class</label>
          <select value={selClass} onChange={e=>{setSelClass(e.target.value);setPage(1);}} className="att-input">
            {CLASSES.map(c=><option key={c} value={c}>{c==="All"?"All Classes":c}</option>)}
          </select>
        </div>
        <div className="view-att-filter-group" style={{flex:1}}>
          <label>Search</label>
          <div className="att-search-box" style={{maxWidth:"100%"}}>
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Search student or adm. no..." value={search}
              onChange={e=>{setSearch(e.target.value);setPage(1);}} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="view-att-table-card">
        <table className="view-att-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Adm. No</th>
              <th>Class</th>
              <th>Date</th>
              <th style={{textAlign:"center"}}>Status</th>
              <th style={{textAlign:"center"}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="att-num" style={{textAlign:"center",padding:"40px",color:"#7b8099"}}>
                  <i className="bx bx-search-alt" style={{fontSize:32,display:"block",marginBottom:8,color:"#d1d5e8"}}></i>
                  No records found
                </td>
              </tr>
            ) : paginated.map((r,i) => (
              <tr key={r.id}>
                <td className="att-num">{(page-1)*PAGE_SIZE+i+1}</td>
                <td>
                  <div className="view-att-student-cell">
                    <div className="att-avatar" style={{background:avatarColors[i%avatarColors.length]}}>
                      {getInitials(r.student)}
                    </div>
                    <span className="att-name">{r.student}</span>
                  </div>
                </td>
                <td className="att-adm">{r.admNo}</td>
                <td><span className="view-att-class-badge">{r.class}</span></td>
                <td style={{fontSize:12,color:"#6b7280"}}>{r.date}</td>
                <td style={{textAlign:"center"}}>
                  <span className={`att-status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                </td>
                <td style={{textAlign:"center"}}>
                  <button style={{width:30,height:30,borderRadius:8,border:"none",background:"#fef2f2",color:"#ef4444",cursor:"pointer",fontSize:15,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
                    <i className="bx bx-trash"></i>
                  </button>
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
            Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}
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
