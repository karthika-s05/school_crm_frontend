import React, { useState, useEffect, useCallback } from "react";
import "../modules.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAssignment, createAssignment, deletetAssignment,
  getClass, getSection, getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const COLORS = ["#2D3A8C","#E8541A","#16a34a","#7c3aed","#d97706","#0891b2"];
const initials = (s) => (s || "?").slice(0, 2).toUpperCase();
const EMPTY_FORM = { id: 0, classId: "", sectionId: "", subjectId: "", title: "", description: "", startDate: "", endDate: "" };

export default function Assignment() {
  const token = getToken();
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter,   setFilter]   = useState({ classId: "", sectionId: "" });
  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const PAGE = 8;

  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [viewItem,  setViewItem]  = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, sec, sub] = await Promise.all([
          getClass(0, token), getSection(0, token), getSubject(0, token),
        ]);
        setClasses(Array.isArray(cls) ? cls : []);
        setSections(Array.isArray(sec) ? sec : []);
        setSubjects(Array.isArray(sub) ? sub : []);
        const c0 = Array.isArray(cls) && cls[0];
        const s0 = Array.isArray(sec) && sec[0];
        if (c0) setFilter(p => ({ ...p, classId: String(c0.id) }));
        if (s0) setFilter(p => ({ ...p, sectionId: String(s0.id) }));
      } catch { toast.error("Failed to load filters"); }
    };
    if (token) load();
  }, [token]);

  const fetchAssignments = useCallback(async () => {
    if (!filter.classId || !filter.sectionId) return;
    setLoading(true);
    await runApi(
      () => getAssignment({classId: Number(filter.classId), sectionId: Number(filter.sectionId), pageNo: 1 }, token),
      { onSuccess: (res) => setRows(res.data || []), onError: () => setRows([]) }
    );
    setLoading(false);
  }, [filter, token]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = rows.filter(r =>
    [r.title, r.subject, r.className, r.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE);
  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const openAdd  = () => { setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ id: r.id || 0, classId: String(r.classId || filter.classId), sectionId: String(r.sectionId || filter.sectionId), subjectId: String(r.subjectId || ""), title: r.title || "", description: r.description || "", startDate: r.startDate || "", endDate: r.endDate || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) { toast.warning("Title and dates are required"); return; }
    setSaving(true);
    await runApi(
      () => createAssignment({ id: form.id, classId: Number(form.classId || filter.classId), sectionId: Number(form.sectionId || filter.sectionId), subjectId: Number(form.subjectId) || 0, title: form.title, description: form.description, startDate: form.startDate, endDate: form.endDate }, token),
      { successMsg: form.id ? "Assignment updated!" : "Assignment created!", onSuccess: () => { setShowModal(false); fetchAssignments(); } }
    );
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await runApi(() => deletetAssignment(id, token), { successMsg: "Deleted!", onSuccess: fetchAssignments });
  };

  const subjectName = (id) => subjects.find(s => s.id === Number(id))?.name || id || "—";

  const getStatus = (r) => {
    const now = new Date();
    const end = r.endDate ? new Date(r.endDate) : null;
    const start = r.startDate ? new Date(r.startDate) : null;
    if (r.status) return r.status;
    if (!end) return "Active";
    if (end < now) return "Closed";
    if (start && start > now) return "Upcoming";
    return "Active";
  };

  const statusBadge = (s) => {
    const map = { Active: "mod-badge-green", Closed: "mod-badge-red", Upcoming: "mod-badge-blue" };
    return map[s] || "mod-badge-gray";
  };

  return (
    <div className="mod-wrap">
      {/* Header */}
      <div className="mod-header">
        <div>
          {/* <h2 className="mod-title">Assignments</h2>
          <p className="mod-sub">Create and manage class assignments</p> */}
        </div>
        <div className="mod-pills">
          <span className="mod-pill blue"><i className="bx bx-task"></i>{rows.length} Total</span>
          <button className="mod-btn mod-btn-primary" onClick={openAdd}>
            <i className="bx bx-plus"></i> Add Assignment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mod-filter-card">
        <div className="mod-filter-group">
          <label>Class</label>
          <select className="mod-input" value={filter.classId} onChange={e => setFilter(p => ({ ...p, classId: e.target.value }))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name || c.className}</option>)}
          </select>
        </div>
        <div className="mod-filter-group">
          <label>Section</label>
          <select className="mod-input" value={filter.sectionId} onChange={e => setFilter(p => ({ ...p, sectionId: e.target.value }))}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>)}
          </select>
        </div>
        <button className="mod-btn mod-btn-ghost" onClick={fetchAssignments}><i className="bx bx-refresh"></i> Refresh</button>
      </div>

      {/* Table */}
      <div className="mod-table-card">
        <div className="mod-table-toolbar">
          <div className="mod-search">
            <i className="bx bx-search"></i>
            <input placeholder="Search assignments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <span className="mod-pill blue">{filtered.length} records</span>
        </div>

        {loading ? (
          <div className="mod-table-body-wrap">
            <div className="mod-loading"><div className="mod-spinner"></div> Loading assignments...</div>
          </div>
        ) : paged.length === 0 ? (
          <div className="mod-table-body-wrap">
            <div className="mod-empty"><i className="bx bx-task"></i><p>No assignments found</p></div>
          </div>
        ) : (
          <div className="mod-table-body-wrap">
          <table className="mod-table">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>#</th><th>Title</th><th>Subject</th><th>Class</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => {
                const status = getStatus(r);
                return (
                  <tr key={r.id || i}>
                    <td>{(page - 1) * PAGE + i + 1}</td>
                    <td>
                      <div className="mod-avatar-cell">
                        <div className="mod-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                          {initials(r.title)}
                        </div>
                        <div>
                          <div className="mod-cell-name">{r.title}</div>
                          <div className="mod-cell-sub" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.subject || subjectName(r.subjectId)}</td>
                    <td><span className="mod-badge mod-badge-blue">{r.className || `${filter.className}`} – {r.section || `Sec ${filter.section}`}</span></td>
                    <td>{r.startDate || "—"}</td>
                    <td>{r.endDate || "—"}</td>
                    <td><span className={`mod-badge ${statusBadge(status)}`}>{status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="mod-action-btn" title="View" onClick={() => setViewItem(r)}><i className="bx bx-show"></i></button>
                        <button className="mod-action-btn edit" title="Edit" onClick={() => openEdit(r)}><i className="bx bx-edit"></i></button>
                        <button className="mod-action-btn danger" title="Delete" onClick={() => handleDelete(r.id)}><i className="bx bx-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mod-pagination">
            <span className="mod-page-info">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}</span>
            <div className="mod-page-btns">
              <button className="mod-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="bx bx-chevron-left"></i></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`mod-page-btn${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="mod-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><i className="bx bx-chevron-right"></i></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="mod-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mod-modal" onClick={e => e.stopPropagation()}>
            <div className="mod-modal-header">
              <h3>{form.id ? "Edit Assignment" : "Add Assignment"}</h3>
              <button className="mod-modal-close" onClick={() => setShowModal(false)}><i className="bx bx-x"></i></button>
            </div>
            <div className="mod-modal-body">
              <div className="mod-form-row">
                <div className="mod-form-group">
                  <label>Class</label>
                  <select className="mod-input" value={form.classId || filter.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name || c.className}</option>)}
                  </select>
                </div>
                <div className="mod-form-group">
                  <label>Section</label>
                  <select className="mod-input" value={form.sectionId || filter.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))}>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>)}
                  </select>
                </div>
              </div>
              <div className="mod-form-row">
                <div className="mod-form-group">
                  <label>Subject</label>
                  <select className="mod-input" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="mod-form-group">
                  <label>Title</label>
                  <input className="mod-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Assignment title" />
                </div>
              </div>
              <div className="mod-form-row">
                <div className="mod-form-group">
                  <label>Start Date</label>
                  <input type="date" className="mod-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="mod-form-group">
                  <label>End Date</label>
                  <input type="date" className="mod-input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="mod-form-row full">
                <div className="mod-form-group">
                  <label>Description</label>
                  <textarea className="mod-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Assignment description..." />
                </div>
              </div>
            </div>
            <div className="mod-modal-footer">
              <button className="mod-btn mod-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="mod-btn mod-btn-primary" onClick={handleSave} disabled={saving}>
                <i className="bx bx-save"></i> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="mod-modal-overlay" onClick={() => setViewItem(null)}>
          <div className="mod-modal" onClick={e => e.stopPropagation()}>
            <div className="mod-modal-header">
              <h3>Assignment Details</h3>
              <button className="mod-modal-close" onClick={() => setViewItem(null)}><i className="bx bx-x"></i></button>
            </div>
            <div className="mod-modal-body">
              {[
                ["Title",       viewItem.title],
                ["Subject",     viewItem.subject || subjectName(viewItem.subjectId)],
                ["Class",       viewItem.className || `Class ${filter.classId}`],
                ["Section",     viewItem.section || `Section ${filter.sectionId}`],
                ["Start Date",  viewItem.startDate || "—"],
                ["End Date",    viewItem.endDate || "—"],
                ["Status",      getStatus(viewItem)],
                ["Description", viewItem.description],
              ].map(([label, value]) => (
                <div className="mod-detail-row" key={label}>
                  <span className="mod-detail-label">{label}</span>
                  <span className="mod-detail-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="mod-modal-footer">
              <button className="mod-btn mod-btn-ghost" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} style={{ fontSize: 14 }} />
    </div>
  );
}
