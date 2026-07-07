import React, { useState, useEffect, useCallback } from "react";
import "../modules.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getHomework,
  getbyidHomework,
  createHomework,
  deleteHomework,
  getClass,
  getSection,
  getSubject,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const COLORS = ["#2D3A8C", "#E8541A", "#16a34a", "#7c3aed", "#d97706", "#0891b2"];
const toInitials = (s) => (s || "?").slice(0, 2).toUpperCase();
const PAGE_SIZE = 8;

const EMPTY_FORM = {
  id: 0,
  classId: "",
  sectionId: "",
  subjectId: "",
  description: "",
  date: "",
};

// Normalise the homework list response — handles both array and { data: [] } shapes
const normalizeList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

export default function Homework() {
  const token = getToken();

  //  Master data 
  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  //  Filter state ─
  const [filter, setFilter] = useState({ classId: "", sectionId: "", subjectId: "0" });

  //  Table state 
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);

  //  Modal state 
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [loadingForm,setLoadingForm]= useState(false);
  const [viewItem,   setViewItem]   = useState(null);
  const [deleting,   setDeleting]   = useState(null); // id being deleted

  //  Load master dropdowns ─
  useEffect(() => {
    if (!token) return;
    const loadMasters = async () => {
      try {
        const [cls, sec, sub] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getSubject(0, token),
        ]);
        const clsList  = Array.isArray(cls) ? cls : [];
        const secList  = Array.isArray(sec) ? sec : [];
        const subList  = Array.isArray(sub) ? sub : [];
        setClasses(clsList);
        setSections(secList);
        setSubjects(subList);
        // Set default filter values once masters are loaded
        setFilter(prev => ({
          ...prev,
          classId:   clsList[0]  ? String(clsList[0].id)  : "",
          sectionId: secList[0]  ? String(secList[0].id)  : "",
        }));
      } catch {
        toast.error("Failed to load class / section / subject lists");
      }
    };
    loadMasters();
  }, [token]);

  //  GET /get_homework (POST with body) 
  const fetchHomework = useCallback(async () => {
    if (!filter.classId || !filter.sectionId) return;
    setLoading(true);
    await runApi(
      () => getHomework(
        {
          classId:   Number(filter.classId),
          sectionId: Number(filter.sectionId),
          subjectId: Number(filter.subjectId) || 0,
        },
        token
      ),
      {
        onSuccess: (res) => {
          setRows(normalizeList(res));
          setPage(1);
        },
        onError: () => setRows([]),
      }
    );
    setLoading(false);
  }, [filter, token]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  //  Derived / pagination 
  const filtered = rows.filter((r) =>
    [r.description, r.subject, r.className, r.subjectName]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const subjectLabel = (id) =>
    subjects.find((s) => s.id === Number(id))?.name || String(id || "—");

  //  Open Add modal 
  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      classId:   filter.classId,
      sectionId: filter.sectionId,
    });
    setShowModal(true);
  };

  //  GET /get_homework_by_id → open Edit modal ─
  const openEdit = async (row) => {
    setLoadingForm(true);
    setShowModal(true);
    // Pre-fill immediately from row data so modal opens fast
    setForm({
      id:          row.id || 0,
      classId:     String(row.classId   || filter.classId),
      sectionId:   String(row.sectionId || filter.sectionId),
      subjectId:   String(row.subjectId || ""),
      description: row.description || "",
      date:        row.date        || "",
    });
    // Then fetch fresh data from API
    await runApi(
      () => getbyidHomework({ id: row.id }, token),
      {
        onSuccess: (res) => {
          const d = Array.isArray(res.data) ? res.data[0] : res.data;
          if (d) {
            setForm({
              id:          d.id          || row.id,
              classId:     String(d.classId   || row.classId   || filter.classId),
              sectionId:   String(d.sectionId || row.sectionId || filter.sectionId),
              subjectId:   String(d.subjectId || row.subjectId || ""),
              description: d.description || row.description || "",
              date:        d.date        || row.date        || "",
            });
          }
        },
      }
    );
    setLoadingForm(false);
  };

  //  POST /create_update_homework 
  const handleSave = async () => {
    if (!form.description.trim()) {
      toast.warning("Description is required");
      return;
    }
    if (!form.date) {
      toast.warning("Due date is required");
      return;
    }
    setSaving(true);
    await runApi(
      () => createHomework(
        {
          id:          Number(form.id) || 0,
          classId:     Number(form.classId   || filter.classId),
          sectionId:   Number(form.sectionId || filter.sectionId),
          subjectId:   Number(form.subjectId) || 0,
          description: form.description.trim(),
          date:        form.date,
        },
        token
      ),
      {
        successMsg: form.id ? "Homework updated successfully!" : "Homework created successfully!",
        onSuccess: () => {
          setShowModal(false);
          fetchHomework();
        },
      }
    );
    setSaving(false);
  };

  //  POST /delete_homework/:id ─
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;
    setDeleting(id);
    await runApi(
      () => deleteHomework(id, token),
      {
        successMsg: "Homework deleted successfully!",
        onSuccess:  fetchHomework,
      }
    );
    setDeleting(null);
  };

  //  View detail (uses row data; no extra API call needed) ─
  const openView = (row) => setViewItem(row);

  //  Filter helpers 
  const setF = (key, val) => setFilter((p) => ({ ...p, [key]: val }));

  //  Status helper ─
  const getStatus = (dateStr) => {
    if (!dateStr) return { label: "Active", cls: "mod-badge-green" };
    const due = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now
      ? { label: "Overdue", cls: "mod-badge-red" }
      : { label: "Active",  cls: "mod-badge-green" };
  };

  return (
    <div className="mod-wrap">

      {/*  Page Header  */}
      <div className="mod-header">
        <div>
          <h2 className="mod-title">Homework</h2>
          <p className="mod-sub">Manage and track homework assignments for your classes</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mod-pill blue">
            <i className="bx bxs-book"></i> {rows.length} Total
          </span>
          <button className="mod-btn mod-btn-primary" onClick={openAdd}>
            <i className="bx bx-plus"></i> Add Homework
          </button>
        </div>
      </div>

      {/*  Filters POST /get_homework  */}
      <div className="mod-filter-card">
        <div className="mod-filter-group">
          <label>Class</label>
          <select
            className="mod-input"
            value={filter.classId}
            onChange={(e) => setF("classId", e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.className}</option>
            ))}
          </select>
        </div>

        <div className="mod-filter-group">
          <label>Section</label>
          <select
            className="mod-input"
            value={filter.sectionId}
            onChange={(e) => setF("sectionId", e.target.value)}
          >
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>
            ))}
          </select>
        </div>

        <div className="mod-filter-group">
          <label>Subject</label>
          <select
            className="mod-input"
            value={filter.subjectId}
            onChange={(e) => setF("subjectId", e.target.value)}
          >
            <option value="0">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button className="mod-btn mod-btn-primary" onClick={fetchHomework}>
          <i className="bx bx-search"></i> Search
        </button>
        <button className="mod-btn mod-btn-ghost" onClick={fetchHomework}>
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </div>

      {/*  Table  */}
      <div className="mod-table-card">
        <div className="mod-table-toolbar">
          <div className="mod-search">
            <i className="bx bx-search"></i>
            <input
              placeholder="Search by description, subject, class..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <span className="mod-pill blue">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="mod-loading">
            <div className="mod-spinner"></div> Loading homework...
          </div>
        ) : paged.length === 0 ? (
          <div className="mod-empty">
            <i className="bx bx-book-open"></i>
            <p>{rows.length === 0 ? "No homework found for selected filters" : "No results match your search"}</p>
          </div>
        ) : (
          <table className="mod-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Subject</th>
                <th>Description</th>
                <th>Class / Section</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => {
                const status  = getStatus(r.date);
                const subjLabel = r.subject || r.subjectName || subjectLabel(r.subjectId);
                const colorIdx  = i % COLORS.length;
                return (
                  <tr key={r.id ?? i}>
                    <td>{(page - 1) * PAGE_SIZE + i + 1}</td>

                    {/* Subject cell with avatar */}
                    <td>
                      <div className="mod-avatar-cell">
                        <div
                          className="mod-avatar"
                          style={{ background: COLORS[colorIdx] }}
                        >
                          {toInitials(subjLabel)}
                        </div>
                        <div>
                          <div className="mod-cell-name">{subjLabel}</div>
                        </div>
                      </div>
                    </td>

                    {/* Description — truncated */}
                    <td style={{ maxWidth: 260 }}>
                      <span style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {r.description || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="mod-badge mod-badge-blue">
                        {r.className || `Class ${r.classId || filter.classId}`}
                        {r.sectionName ? ` – ${r.sectionName}` : ""}
                      </span>
                    </td>

                    <td>{r.date || "—"}</td>

                    <td>
                      <span className={`mod-badge ${status.cls}`}>{status.label}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="mod-action-btn"
                          title="View details"
                          onClick={() => openView(r)}
                        >
                          <i className="bx bx-show"></i>
                        </button>
                        <button
                          className="mod-action-btn edit"
                          title="Edit"
                          onClick={() => openEdit(r)}
                        >
                          <i className="bx bx-edit"></i>
                        </button>
                        <button
                          className="mod-action-btn danger"
                          title="Delete"
                          disabled={deleting === r.id}
                          onClick={() => handleDelete(r.id)}
                        >
                          {deleting === r.id
                            ? <i className="bx bx-loader-alt bx-spin"></i>
                            : <i className="bx bx-trash"></i>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mod-pagination">
            <span className="mod-page-info">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="mod-page-btns">
              <button
                className="mod-page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="bx bx-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`mod-page-btn${page === i + 1 ? " active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="mod-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="bx bx-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/*  Add / Edit Modal — POST /create_update_homework  */}
      {showModal && (
        <div className="mod-modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mod-modal-header">
              <h3>{form.id ? "Edit Homework" : "Add Homework"}</h3>
              <button
                className="mod-modal-close"
                onClick={() => !saving && setShowModal(false)}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            <div className="mod-modal-body">
              {loadingForm ? (
                <div className="mod-loading" style={{ padding: "30px 0" }}>
                  <div className="mod-spinner"></div> Loading homework data...
                </div>
              ) : (
                <>
                  {/* Row 1: Class + Section */}
                  <div className="mod-form-row">
                    <div className="mod-form-group">
                      <label>Class <span style={{ color: "#ef4444" }}>*</span></label>
                      <select
                        className="mod-input"
                        value={form.classId || filter.classId}
                        onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                      >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name || c.className}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mod-form-group">
                      <label>Section <span style={{ color: "#ef4444" }}>*</span></label>
                      <select
                        className="mod-input"
                        value={form.sectionId || filter.sectionId}
                        onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                      >
                        <option value="">Select Section</option>
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>{s.name || s.sectionName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Subject + Due Date */}
                  <div className="mod-form-row">
                    <div className="mod-form-group">
                      <label>Subject</label>
                      <select
                        className="mod-input"
                        value={form.subjectId}
                        onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mod-form-group">
                      <label>Due Date <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="date"
                        className="mod-input"
                        value={form.date}
                        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Row 3: Description */}
                  <div className="mod-form-row full">
                    <div className="mod-form-group">
                      <label>Description <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea
                        className="mod-input"
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Enter homework description..."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mod-modal-footer">
              <button
                className="mod-btn mod-btn-ghost"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="mod-btn mod-btn-primary"
                onClick={handleSave}
                disabled={saving || loadingForm}
              >
                <i className={`bx ${saving ? "bx-loader-alt bx-spin" : "bx-save"}`}></i>
                {saving ? "Saving..." : form.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  View Detail Modal  */}
      {viewItem && (
        <div className="mod-modal-overlay" onClick={() => setViewItem(null)}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mod-modal-header">
              <h3>Homework Details</h3>
              <button className="mod-modal-close" onClick={() => setViewItem(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="mod-modal-body">
              {[
                ["ID",          viewItem.id],
                ["Subject",     viewItem.subject || viewItem.subjectName || subjectLabel(viewItem.subjectId)],
                ["Class",       viewItem.className  || `Class ${viewItem.classId   || filter.classId}`],
                ["Section",     viewItem.sectionName || `Section ${viewItem.sectionId || filter.sectionId}`],
                ["Due Date",    viewItem.date        || "—"],
                ["Status",      getStatus(viewItem.date).label],
                ["Description", viewItem.description || "—"],
              ].map(([label, value]) => (
                <div className="mod-detail-row" key={label}>
                  <span className="mod-detail-label">{label}</span>
                  <span className="mod-detail-value">{value}</span>
                </div>
              ))}
            </div>
            <div className="mod-modal-footer">
              <button
                className="mod-btn mod-btn-ghost"
                onClick={() => setViewItem(null)}
              >
                Close
              </button>
              <button
                className="mod-btn mod-btn-primary"
                onClick={() => { setViewItem(null); openEdit(viewItem); }}
              >
                <i className="bx bx-edit"></i> Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} style={{ fontSize: 14 }} />
    </div>
  );
}
