import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import {
  TableDeleteConfirm,
  TableSelectCheckbox,
  TableSelectionToolbar,
} from "../../component/Table/TableSelection";
import useTableSelection from "../../hooks/useTableSelection";
import {
  getExamTypeMaster,
  saveExamTypeMaster,
  deleteExamTypeMaster,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const PER_PAGE = 8;
const EMPTY_FORM = { id: 0, examType: "" };

const errMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const mapExamType = (item) => ({
  id: item.id,
  examType: item.examType,
  createdBy: item.createdBy || "-",
});

export default function ExamType() {
  const token = getToken();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(false);

  const loadExamTypes = useCallback(async () => {
    setLoading(true);
    await runApi(() => getExamTypeMaster(token), {
      onSuccess: (res) => {
        setData(Array.isArray(res.data) ? res.data.map(mapExamType) : []);
      },
      onError: () => setData([]),
    });
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadExamTypes();
  }, [loadExamTypes]);

  const filtered = data.filter((item) =>
    (item.examType || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPgs = Math.ceil(filtered.length / PER_PAGE) || 1;

  // Fall back if the current page no longer holds records.
  useEffect(() => {
    if (page > totalPgs) setPage(totalPgs);
  }, [page, totalPgs]);

  const safePage = Math.min(page, totalPgs);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const selection = useTableSelection({
    rows: paged,
    getRowId: "id",
    resetKey: `${data.length}|${search}`,
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal("add");
  };

  const openEdit = (item) => {
    setForm({ id: item.id, examType: item.examType || "" });
    setModal("edit");
  };

  const saveExamType = async () => {
    const name = form.examType.trim();
    if (!name) {
      toast.error("Please enter the exam type name.");
      return;
    }
    setSaving(true);
    await runApi(
      () => saveExamTypeMaster({ id: modal === "edit" ? form.id : 0, examType: name }, token),
      {
        successMsg:
          modal === "edit" ? "Exam type updated" : "Exam type created",
        onSuccess: () => {
          setModal(null);
          setForm(EMPTY_FORM);
          selection.clearSelection();
          loadExamTypes();
        },
        onError: (err) =>
          toast.error(errMessage(err, "Failed to save exam type")),
      }
    );
    setSaving(false);
  };

  const confirmDelete = async () => {
    const ids = [...selection.selectedRows];
    if (!ids.length) return;
    setSaving(true);
    let okCount = 0;
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await runApi(() => deleteExamTypeMaster(id, token), {});
      if (ok) okCount += 1;
    }
    setSaving(false);
    setDeleting(false);
    if (okCount) {
      toast.success(
        okCount > 1
          ? `${okCount} exam types deleted successfully`
          : "Exam type deleted"
      );
      selection.clearSelection();
      await loadExamTypes();
    } else {
      toast.error("Failed to delete the selected exam type(s)");
    }
  };

  const handleToolbarEdit = () => {
    const item = data.find(
      (d) => String(d.id) === String(selection.singleSelectedId)
    );
    if (item) openEdit(item);
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {[
          { label: "Total Exam Types", val: data.length, icon: "bx bxs-notepad", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Active", val: data.length, icon: "bx bxs-check-circle", color: "#16a34a", bg: "#dcfce7" },
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
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <TableSelectionToolbar
            selectedCount={selection.selectedCount}
            canEdit={selection.canEdit}
            canDelete={selection.canDelete}
            onEdit={handleToolbarEdit}
            onDelete={() => setDeleting(true)}
            onMessage={(msg) => toast.info(msg)}
            disabled={saving}
          />
          <button className="sdl-add-btn" onClick={openAdd}>
            <i className="bx bx-plus"></i> Add Exam Type
          </button>
        </div>
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
                <th className="sdl-th-check">
                  <TableSelectCheckbox
                    checked={selection.allPageSelected}
                    indeterminate={selection.somePageSelected}
                    onChange={selection.toggleSelectAll}
                    ariaLabel="Select all exam types on this page"
                    disabled={!paged.length}
                  />
                </th>
                <th>Exam Type Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={3} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam types found</span>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => {
                  const selected = selection.isSelected(item.id);
                  return (
                    <tr key={item.id} className={selected ? "sdl-row-selected" : undefined}>
                      <td className="sdl-td-check">
                        <TableSelectCheckbox
                          checked={selected}
                          onChange={() => selection.toggleRow(item.id)}
                          ariaLabel={`Select ${item.examType}`}
                        />
                      </td>
                      <td><strong>{item.examType}</strong></td>
                      <td><span className="sdl-status active">Active</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPgs > 1 && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
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
              <span className="svc-modal-title">
                {modal === "edit" ? "Edit Exam Type" : "Add Exam Type"}
              </span>
              <button type="button" className="svc-modal-close" onClick={() => !saving && setModal(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="exam-field">
                <label htmlFor="exam-type-name">Exam Type Name</label>
                <input
                  id="exam-type-name"
                  value={form.examType}
                  onChange={(e) => setForm({ ...form, examType: e.target.value })}
                  placeholder="e.g. Unit Test / Quarterly / Annual"
                  autoFocus
                />
              </div>
            </div>
            <div className="svc-modal-footer">
              <button type="button" className="svc-btn-cancel" onClick={() => !saving && setModal(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="exam-btn-submit" onClick={saveExamType} disabled={saving}>
                {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Saving…</> : modal === "edit" ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TableDeleteConfirm
        open={deleting}
        count={selection.selectedCount}
        loading={saving}
        onCancel={() => !saving && setDeleting(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
