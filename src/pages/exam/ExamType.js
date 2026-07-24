import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import { getExam, createExam, deletetExam, getClass, getSection } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const PER_PAGE = 8;
const EMPTY_FORM = { id: 0, exam: "", totalMark: "", passMark: "", classId: "", sectionId: "" };

const mapExamItem = (item) => ({
  id: item.id,
  name: item.exam,
  maxMarks: item.totalMark,
  passMark: item.passMark,
  classId: item.classId,
  sectionId: item.sectionId,
  className: item.className,
  sectionName: item.sectionName,
  description:
    item.className && item.sectionName
      ? `Class ${item.className} – Section ${item.sectionName} (Pass: ${item.passMark ?? "-"})`
      : `Pass mark: ${item.passMark ?? "-"}`,
  status: "Active",
});

export default function ExamType() {
  const token = getToken();
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState(null);

  const loadExams = useCallback(async () => {
    setLoading(true);
    await runApi(() => getExam({}, token), {
      onSuccess: (res) => {
        const list = Array.isArray(res.data) ? res.data.map(mapExamItem) : [];
        setData(list);
      },
      onError: () => setData([]),
    });
    setLoading(false);
  }, [token]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec] = await Promise.all([getClass(0, token), getSection(0, token)]);
        setClasses(Array.isArray(cls) ? cls : []);
        setSections(Array.isArray(sec) ? sec : []);
      } catch {
        setClasses([]);
        setSections([]);
      }
    };
    loadMeta();
    loadExams();
  }, [loadExams, token]);

  const filtered = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPgs = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const maxMarksStat = data.length
    ? Math.max(...data.map((e) => Number(e.maxMarks) || 0))
    : 0;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal("add");
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      exam: item.name,
      totalMark: item.maxMarks ?? "",
      passMark: item.passMark ?? "",
      classId: item.classId ?? "",
      sectionId: item.sectionId ?? "",
    });
    setModal("edit");
  };

  const saveExam = async () => {
    if (!form.exam || !form.totalMark || !form.passMark || !form.classId || !form.sectionId) {
      return;
    }
    setSaving(true);
    const body = {
      id: modal === "edit" ? form.id : 0,
      exam: form.exam,
      totalMark: form.totalMark,
      passMark: form.passMark,
      classId: parseInt(form.classId, 10),
      sectionId: parseInt(form.sectionId, 10),
    };
    await runApi(() => createExam(body, token), {
      successMsg: modal === "edit" ? "Exam type updated" : "Exam type created",
      onSuccess: () => {
        setModal(null);
        setForm(EMPTY_FORM);
        loadExams();
      },
    });
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    await runApi(() => deletetExam(deletingId, token), {
      successMsg: "Exam type deleted",
      onSuccess: () => {
        setDeletingId(null);
        loadExams();
      },
    });
    setSaving(false);
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total Types", val: data.length, icon: "bx bxs-notepad", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Active", val: data.length, icon: "bx bxs-check-circle", color: "#16a34a", bg: "#dcfce7" },
          { label: "Max Marks", val: maxMarksStat || "-", icon: "bx bxs-trophy", color: "#E8541A", bg: "#fdf0eb" },
        ].map((s, i) => (
          <div className="sdl-stat-card" key={i}>
            <div className="sdl-stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={s.icon}></i>
            </div>
            <div>
              <div className="sdl-stat-val">{s.val}</div>
              <div className="sdl-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sdl-header">
        <div className="sdl-search" style={{ maxWidth: 320 }}>
          <i className="bx bx-search"></i>
          <input
            placeholder="Search exam type…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="sdl-add-btn" onClick={openAdd}>
          <i className="bx bx-plus"></i> Add Exam Type
        </button>
      </div>

      <div className="sdl-table-card">
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading exam types…
          </div>
        ) : (
          <table className="sdl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam Type</th>
                <th>Description</th>
                <th>Max Marks</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam types found</span>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <tr key={item.id}>
                    <td className="sdl-num">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td><strong>{item.name}</strong></td>
                    <td className="sdl-mobile">{item.description}</td>
                    <td>{item.maxMarks}</td>
                    <td><span className="sdl-status active">{item.status}</span></td>
                    <td>
                      <TableActionMenu onEdit={() => openEdit(item)} onDelete={() => setDeletingId(item.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPgs > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="sdl-page-btns">
            <button className="sdl-page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <i className="bx bx-chevron-left"></i>
            </button>
            {Array.from({ length: totalPgs }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`sdl-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="sdl-page-btn" disabled={page === totalPgs} onClick={() => setPage((p) => p + 1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="svc-overlay" onClick={() => !saving && setModal(null)}>
          <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span className="svc-modal-title">{modal === "edit" ? "Edit Exam Type" : "Add Exam Type"}</span>
              <button type="button" className="svc-modal-close" onClick={() => !saving && setModal(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-modal-grid">
                <div className="exam-field">
                  <label>Exam Name</label>
                  <input
                    value={form.exam}
                    onChange={(e) => setForm((p) => ({ ...p, exam: e.target.value }))}
                    placeholder="e.g. Mid-Term Exam"
                  />
                </div>
                <div className="exam-field">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalMark}
                    onChange={(e) => setForm((p) => ({ ...p, totalMark: e.target.value }))}
                  />
                </div>
                <div className="exam-field">
                  <label>Pass Mark</label>
                  <input
                    type="number"
                    min="0"
                    value={form.passMark}
                    onChange={(e) => setForm((p) => ({ ...p, passMark: e.target.value }))}
                  />
                </div>
                <div className="exam-field">
                  <label>Class</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label>Section</label>
                  <select
                    value={form.sectionId}
                    onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                  >
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button type="button" className="svc-btn-cancel" onClick={() => !saving && setModal(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="exam-btn-submit" onClick={saveExam} disabled={saving}>
                {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Saving…</> : modal === "edit" ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="svc-overlay" onClick={() => !saving && setDeletingId(null)}>
          <div className="svc-modal svc-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="svc-delete-body">
              <i className="bx bxs-error-circle svc-delete-icon"></i>
              <p>Delete this exam type?</p>
            </div>
            <div className="svc-modal-footer">
              <button type="button" className="svc-btn-cancel" onClick={() => !saving && setDeletingId(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="svc-btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Deleting…</> : <><i className="bx bx-trash"></i> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
