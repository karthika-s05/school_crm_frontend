import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import {
  getexamPortion,
  createExamportion,
  deletetExamportion,
  getExam,
  getSubject,
  getClass,
  getSection,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const PER_PAGE = 8;
const EMPTY_FORM = {
  id: 0,
  examId: "",
  subjectId: "",
  classId: "",
  sectionId: "",
  examDate: "",
  examFromTime: "",
  examToTime: "",
  portionTitle: "",
  portionDescription: "",
  totalMarks: "",
};

const mapPortionItem = (item) => ({
  id: item.id,
  exam: item.examName || item.exam,
  cls: item.class || item.className,
  section: item.section || item.sectionName,
  subject: item.subject || item.subjectName,
  examDate: item.examDate,
  fromTime: item.examFromTime,
  toTime: item.examToTime,
  portion: item.portionDescription || item.portionTitle || "",
});

export default function ExamPortion() {
  const token = getToken();
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [clsFilter, setClsFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState(null);

  const loadPortions = useCallback(async () => {
    if (!clsFilter || !sectionFilter) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    await runApi(
      () =>
        getexamPortion(
          { id: 0, classId: parseInt(clsFilter, 10), sectionId: parseInt(sectionFilter, 10) },
          token
        ),
      {
        onSuccess: (res) => {
          const list = Array.isArray(res.data) ? res.data.map(mapPortionItem) : [];
          setData(list);
        },
        onError: () => setData([]),
      }
    );
    setLoading(false);
  }, [clsFilter, sectionFilter, token]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec, examRes, subj] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getExam({}, token),
          getSubject(0, token),
        ]);
        const classList = Array.isArray(cls) ? cls : [];
        const sectionList = Array.isArray(sec) ? sec : [];
        setClasses(classList);
        setSections(sectionList);
        setExams(Array.isArray(examRes?.data) ? examRes.data : []);
        setSubjects(Array.isArray(subj) ? subj : []);
        if (classList.length && !clsFilter) setClsFilter(String(classList[0].id));
        if (sectionList.length && !sectionFilter) setSectionFilter(String(sectionList[0].id));
      } catch {
        setClasses([]);
        setSections([]);
        setExams([]);
        setSubjects([]);
      }
    };
    loadMeta();
  }, [token]);

  useEffect(() => {
    if (clsFilter && sectionFilter) loadPortions();
  }, [clsFilter, sectionFilter, loadPortions]);

  const filtered = data.filter((item) => {
    const ms =
      item.exam?.toLowerCase().includes(search.toLowerCase()) ||
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.portion?.toLowerCase().includes(search.toLowerCase());
    return ms;
  });

  const totalPgs = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      classId: clsFilter,
      sectionId: sectionFilter,
    });
    setModal("add");
  };

  const savePortion = async () => {
    if (
      !form.examId ||
      !form.subjectId ||
      !form.classId ||
      !form.sectionId ||
      !form.examDate ||
      !form.examFromTime ||
      !form.examToTime ||
      !form.portionTitle
    ) {
      return;
    }
    setSaving(true);
    const body = {
      id: modal === "edit" ? form.id : 0,
      examId: parseInt(form.examId, 10),
      subjectId: parseInt(form.subjectId, 10),
      classId: parseInt(form.classId, 10),
      sectionId: parseInt(form.sectionId, 10),
      examDate: form.examDate,
      examFromTime: form.examFromTime,
      examToTime: form.examToTime,
      portionTitle: form.portionTitle,
      portionDescription: form.portionDescription || "",
      totalMarks: form.totalMarks || 100,
    };
    await runApi(() => createExamportion(body, token), {
      successMsg: modal === "edit" ? "Exam portion updated" : "Exam portion created",
      onSuccess: () => {
        setModal(null);
        setForm(EMPTY_FORM);
        loadPortions();
      },
    });
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    await runApi(() => deletetExamportion(deletingId, token), {
      successMsg: "Exam portion deleted",
      onSuccess: () => {
        setDeletingId(null);
        loadPortions();
      },
    });
    setSaving(false);
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="top-right" autoClose={2000} style={{ fontSize: "14px" }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total Schedules", val: data.length, icon: "bx bxs-calendar", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Classes Covered", val: new Set(data.map((d) => d.cls)).size, icon: "bx bxs-school", color: "#16a34a", bg: "#dcfce7" },
          { label: "Subjects", val: new Set(data.map((d) => d.subject)).size, icon: "bx bxs-book", color: "#E8541A", bg: "#fdf0eb" },
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
            placeholder="Search exam, subject, portion…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            className="svc-select"
            value={clsFilter}
            onChange={(e) => {
              setClsFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>Class {c.name}</option>
            ))}
          </select>
          <select
            className="svc-select"
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Select Section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name}</option>
            ))}
          </select>
          <button className="sdl-add-btn" onClick={openAdd} disabled={!clsFilter || !sectionFilter}>
            <i className="bx bx-plus"></i> Add Portion
          </button>
        </div>
      </div>

      <div className="sdl-table-card">
        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading exam portions…
          </div>
        ) : (
          <table className="sdl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Portion</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam portions found</span>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <tr key={item.id}>
                    <td className="sdl-num">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td><strong>{item.exam}</strong></td>
                    <td><span className="sdl-class-badge">Class {item.cls}-{item.section}</span></td>
                    <td><span className="svc-cat-badge">{item.subject}</span></td>
                    <td className="sdl-dob">{item.examDate}</td>
                    <td className="sdl-mobile">{item.fromTime} – {item.toTime}</td>
                    <td className="sdl-mobile" style={{ maxWidth: 220, whiteSpace: "normal" }}>{item.portion}</td>
                    <td>
                      <TableActionMenu onView={() => {}} onEdit={() => {}} onDelete={() => setDeletingId(item.id)} />
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
          <div className="svc-modal svc-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span className="svc-modal-title">Add Exam Portion</span>
              <button type="button" className="svc-modal-close" onClick={() => !saving && setModal(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-modal-grid">
                <div className="exam-field">
                  <label>Exam</label>
                  <select value={form.examId} onChange={(e) => setForm((p) => ({ ...p, examId: e.target.value }))}>
                    <option value="">Select Exam</option>
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>{e.exam}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label>Subject</label>
                  <select value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label>Class</label>
                  <select value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}>
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label>Section</label>
                  <select value={form.sectionId} onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}>
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label>Exam Date</label>
                  <input type="date" value={form.examDate} onChange={(e) => setForm((p) => ({ ...p, examDate: e.target.value }))} />
                </div>
                <div className="exam-field">
                  <label>From Time</label>
                  <input type="time" value={form.examFromTime} onChange={(e) => setForm((p) => ({ ...p, examFromTime: e.target.value }))} />
                </div>
                <div className="exam-field">
                  <label>To Time</label>
                  <input type="time" value={form.examToTime} onChange={(e) => setForm((p) => ({ ...p, examToTime: e.target.value }))} />
                </div>
                <div className="exam-field">
                  <label>Total Marks</label>
                  <input type="number" min="0" value={form.totalMarks} onChange={(e) => setForm((p) => ({ ...p, totalMarks: e.target.value }))} />
                </div>
                <div className="exam-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Portion Title</label>
                  <input value={form.portionTitle} onChange={(e) => setForm((p) => ({ ...p, portionTitle: e.target.value }))} />
                </div>
                <div className="exam-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Portion Description</label>
                  <input value={form.portionDescription} onChange={(e) => setForm((p) => ({ ...p, portionDescription: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="svc-modal-footer">
              <button type="button" className="svc-btn-cancel" onClick={() => !saving && setModal(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="exam-btn-submit" onClick={savePortion} disabled={saving}>
                {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Saving…</> : "Create"}
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
              <p>Delete this exam portion?</p>
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
