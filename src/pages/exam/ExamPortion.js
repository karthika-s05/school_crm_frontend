import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  getexamPortion,
  deletetExamportion,
  getExamTypeMaster,
  getAcademicYear,
  createExamSchedule,
  setExamSchedulePublished,
  getSubject,
  getSubjectClass,
  getClass,
  getSection,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

const PER_PAGE = 8;
const ALL_SECTIONS = "all";

const EMPTY_FORM = {
  examTypeId: "",
  academicYear: "",
  classId: "",
  sectionMode: "",
  totalMark: "",
  passMark: "",
};

const errMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const mapScheduleItem = (item) => ({
  id: item.id,
  exam: item.examName || item.exam,
  cls: item.class || item.className,
  section: item.section || item.sectionName,
  subject: item.subject || item.subjectName,
  examDate: item.examDate,
  fromTime: item.examFromTime,
  toTime: item.examToTime,
  isPublished: Number(item.isPublished) === 1,
});

const mapSubjectOption = (item) => ({
  id: item.subjectId ?? item.id,
  name: item.subjectName || item.subject || item.name || "",
});

export default function ExamPortion() {
  const token = getToken();
  const isAdmin = String(getUserData("role") || "").toLowerCase() === "admin";

  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [search, setSearch] = useState("");
  const [clsFilter, setClsFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subjectRows, setSubjectRows] = useState([]);
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!clsFilter || !sectionFilter) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    await runApi(
      () =>
        getexamPortion(
          {
            id: 0,
            classId: parseInt(clsFilter, 10),
            sectionId: parseInt(sectionFilter, 10),
          },
          token
        ),
      {
        onSuccess: (res) => {
          setData(Array.isArray(res.data) ? res.data.map(mapScheduleItem) : []);
        },
        onError: () => setData([]),
      }
    );
    setLoading(false);
  }, [clsFilter, sectionFilter, token]);

  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      const [cls, sec, subj, yearRes, typeRes] = await Promise.all([
        getClass(0, token).catch(() => []),
        getSection(0, token).catch(() => []),
        getSubject(0, token).catch(() => []),
        getAcademicYear(token).catch(() => null),
        isAdmin ? getExamTypeMaster(token).catch(() => null) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      const classList = Array.isArray(cls) ? cls : [];
      const sectionList = Array.isArray(sec) ? sec : [];
      const yearList = Array.isArray(yearRes?.data) ? yearRes.data : [];

      setClasses(classList);
      setSections(sectionList);
      setAllSubjects((Array.isArray(subj) ? subj : []).map(mapSubjectOption));
      setAcademicYears(yearList);
      setExamTypes(Array.isArray(typeRes?.data) ? typeRes.data : []);

      setClsFilter((prev) => prev || (classList.length ? String(classList[0].id) : ""));
      setSectionFilter((prev) => prev || (sectionList.length ? String(sectionList[0].id) : ""));
    };
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const activeAcademicYear = useMemo(() => {
    const active =
      academicYears.find((item) => String(item.isActive) === "1") ||
      academicYears[0] ||
      null;
    return active?.academicYear || active?.name || "";
  }, [academicYears]);

  const yearOptions = useMemo(
    () =>
      academicYears
        .map((item) => item.academicYear || item.name)
        .filter(Boolean),
    [academicYears]
  );

  /** Sections belonging to the selected class (sections without a class map to all). */
  const formSections = useMemo(() => {
    if (!form.classId) return [];
    return sections.filter((s) => {
      const cid = s.classId ?? s.class_id;
      return cid == null || String(cid) === String(form.classId);
    });
  }, [sections, form.classId]);

  const selectedSectionIds = useMemo(() => {
    if (!form.sectionMode) return [];
    if (form.sectionMode === ALL_SECTIONS)
      return formSections.map((s) => Number(s.id));
    return [Number(form.sectionMode)];
  }, [form.sectionMode, formSections]);

  // Subject list for the selected class: mapped subjects when available, else all subjects.
  useEffect(() => {
    if (!modalOpen || !form.classId) {
      setSubjectOptions([]);
      return;
    }
    let cancelled = false;
    const lookupSectionId = selectedSectionIds[0];
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      let mapped = [];
      if (lookupSectionId) {
        try {
          const res = await getSubjectClass(
            { classId: Number(form.classId), sectionId: lookupSectionId },
            token
          );
          const rows = Array.isArray(res?.data) ? res.data : [];
          mapped = rows.map(mapSubjectOption).filter((s) => s.id && s.name);
        } catch {
          mapped = [];
        }
      }
      if (cancelled) return;
      setSubjectOptions(mapped.length ? mapped : allSubjects);
      setLoadingSubjects(false);
    };
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, [modalOpen, form.classId, selectedSectionIds, allSubjects, token]);

  // Drop schedule rows whose subject is no longer offered for the selection.
  useEffect(() => {
    if (!subjectOptions.length) return;
    setSubjectRows((prev) =>
      prev.filter((row) =>
        subjectOptions.some((s) => String(s.id) === String(row.subjectId))
      )
    );
  }, [subjectOptions]);

  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.exam?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q)
    );
  });

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
    resetKey: `${data.length}|${search}|${clsFilter}|${sectionFilter}`,
  });

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setSubjectPickerOpen(false);
    setForm(EMPTY_FORM);
    setSubjectRows([]);
  };

  const openAdd = () => {
    const sectionBelongsToClass = sections.some((s) => {
      if (String(s.id) !== String(sectionFilter)) return false;
      const cid = s.classId ?? s.class_id;
      return cid == null || String(cid) === String(clsFilter);
    });
    setForm({
      ...EMPTY_FORM,
      academicYear: activeAcademicYear,
      classId: clsFilter || "",
      sectionMode: clsFilter && sectionBelongsToClass ? sectionFilter : "",
    });
    setSubjectRows([]);
    setSubjectPickerOpen(false);
    setModalOpen(true);
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const toggleSubject = (subject) => {
    setSubjectRows((prev) => {
      const exists = prev.some((r) => String(r.subjectId) === String(subject.id));
      if (exists)
        return prev.filter((r) => String(r.subjectId) !== String(subject.id));
      return [
        ...prev,
        {
          subjectId: subject.id,
          subjectName: subject.name,
          examDate: "",
          startTime: "",
          endTime: "",
        },
      ];
    });
  };

  const updateSubjectRow = (subjectId, patch) => {
    setSubjectRows((prev) =>
      prev.map((row) =>
        String(row.subjectId) === String(subjectId) ? { ...row, ...patch } : row
      )
    );
  };

  const validate = () => {
    if (!form.examTypeId) return "Please select an exam type.";
    if (!form.academicYear) return "Please select an academic year.";
    if (!form.classId) return "Please select a class.";
    if (!selectedSectionIds.length) return "Please select a section.";
    if (!subjectRows.length) return "Please select at least one subject.";
    for (const row of subjectRows) {
      if (!row.examDate || !row.startTime || !row.endTime)
        return `Please fill exam date and time for ${row.subjectName}.`;
      if (String(row.endTime) <= String(row.startTime))
        return `End time must be after start time for ${row.subjectName}.`;
    }
    if (!form.totalMark || Number(form.totalMark) <= 0)
      return "Please enter valid total marks.";
    if (form.passMark === "" || Number(form.passMark) < 0)
      return "Please enter valid pass marks.";
    if (Number(form.passMark) > Number(form.totalMark))
      return "Pass marks cannot be greater than total marks.";
    return "";
  };

  const submitExam = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    const payload = {
      examTypeId: Number(form.examTypeId),
      academicYear: form.academicYear,
      classId: Number(form.classId),
      sectionIds: selectedSectionIds,
      subjects: subjectRows.map((row) => ({
        subjectId: Number(row.subjectId),
        examDate: row.examDate,
        startTime: row.startTime,
        endTime: row.endTime,
      })),
      totalMark: Number(form.totalMark),
      passMark: Number(form.passMark),
    };
    await runApi(() => createExamSchedule(payload, token), {
      successMsg: "Exam scheduled successfully",
      onSuccess: () => {
        setClsFilter(String(form.classId));
        setSectionFilter(String(selectedSectionIds[0]));
        setPage(1);
        setModalOpen(false);
        setSubjectPickerOpen(false);
        setForm(EMPTY_FORM);
        setSubjectRows([]);
        if (
          String(clsFilter) === String(form.classId) &&
          String(sectionFilter) === String(selectedSectionIds[0])
        ) {
          loadSchedules();
        }
      },
      onError: (err) => toast.error(errMessage(err, "Failed to create exam")),
    });
    setSaving(false);
  };

  const confirmDelete = async () => {
    const ids = [...selection.selectedRows];
    if (!ids.length) return;
    setSaving(true);
    let okCount = 0;
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await runApi(() => deletetExamportion(id, token), {});
      if (ok) okCount += 1;
    }
    setSaving(false);
    setDeleting(false);
    if (okCount) {
      toast.success(
        okCount > 1
          ? `${okCount} exam schedules deleted successfully`
          : "Exam schedule deleted"
      );
      selection.clearSelection();
      await loadSchedules();
    } else {
      toast.error("Failed to delete the selected schedule(s)");
    }
  };

  const handleToolbarEdit = () => {
    toast.info(
      "A scheduled exam cannot be edited here. Delete it and add the exam again."
    );
  };

  const selectedSchedules = data.filter((item) =>
    selection.selectedRows.some((id) => String(id) === String(item.id))
  );
  const selectedArePublished =
    selectedSchedules.length > 0 &&
    selectedSchedules.every((item) => item.isPublished);

  const togglePublished = async () => {
    if (!selection.selectedRows.length) {
      toast.info("Please select at least one exam schedule.");
      return;
    }
    setPublishing(true);
    await runApi(
      () =>
        setExamSchedulePublished(
          selection.selectedRows,
          !selectedArePublished,
          token
        ),
      {
        successMsg: selectedArePublished
          ? "Exam timetable moved to draft"
          : "Exam timetable published",
        onSuccess: () => {
          selection.clearSelection();
          loadSchedules();
        },
        onError: (err) =>
          toast.error(errMessage(err, "Failed to update exam timetable")),
      }
    );
    setPublishing(false);
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Total Schedules", val: data.length, icon: "bx bxs-calendar", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Exams Covered", val: new Set(data.map((d) => d.exam)).size, icon: "bx bxs-school", color: "#16a34a", bg: "#dcfce7" },
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
            placeholder="Search exam, subject…"
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
            aria-label="Filter by class"
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
            aria-label="Filter by section"
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
          {isAdmin && (
            <button className="sdl-add-btn" onClick={openAdd}>
              <i className="bx bx-plus"></i> Add Exam
            </button>
          )}
          {isAdmin && (
            <>
              <button
                type="button"
                className="sdl-add-btn"
                onClick={togglePublished}
                disabled={!selection.selectedCount || publishing}
                style={{
                  background: selectedArePublished ? "#fff7ed" : "#ecfdf5",
                  color: selectedArePublished ? "#c2410c" : "#166534",
                  border: `1px solid ${selectedArePublished ? "#fdba74" : "#86efac"}`,
                }}
              >
                <i className={`bx ${publishing ? "bx-loader-alt bx-spin" : "bx-upload"}`}></i>
                {selectedArePublished ? "Move to Draft" : "Publish Timetable"}
              </button>
              <TableSelectionToolbar
                selectedCount={selection.selectedCount}
                canEdit={selection.canEdit}
                canDelete={selection.canDelete}
                onEdit={handleToolbarEdit}
                onDelete={() => setDeleting(true)}
                onMessage={(msg) => toast.info(msg)}
                disabled={saving || publishing}
              />
            </>
          )}
        </div>
      </div>

      <div className="sdl-table-card">
        {loading ? (
          <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading exam schedule…
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
                    ariaLabel="Select all schedules on this page"
                    disabled={!paged.length}
                  />
                </th>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam schedules found</span>
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
                          ariaLabel={`Select schedule ${item.exam}`}
                        />
                      </td>
                      <td><strong>{item.exam}</strong></td>
                      <td><span className="sdl-class-badge">Class {item.cls}-{item.section}</span></td>
                      <td><span className="svc-cat-badge">{item.subject}</span></td>
                      <td className="sdl-dob">{item.examDate}</td>
                      <td className="sdl-mobile">{item.fromTime} – {item.toTime}</td>
                      <td>
                        <span className={`sdl-status ${item.isPublished ? "active" : "draft"}`}>
                          {item.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
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

      {modalOpen && (
        <div className="svc-overlay" onClick={closeModal}>
          <div className="svc-modal svc-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="svc-modal-hdr">
              <span className="svc-modal-title">Add Exam</span>
              <button type="button" className="svc-modal-close" onClick={closeModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="svc-modal-body">
              <div className="svc-modal-grid">
                <div className="exam-field">
                  <label htmlFor="exam-type">Exam Type</label>
                  <select
                    id="exam-type"
                    value={form.examTypeId}
                    onChange={(e) => updateForm({ examTypeId: e.target.value })}
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.examType}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label htmlFor="exam-academic-year">Academic Year</label>
                  <select
                    id="exam-academic-year"
                    value={form.academicYear}
                    onChange={(e) => updateForm({ academicYear: e.target.value })}
                  >
                    <option value="">Select Academic Year</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label htmlFor="exam-class">Class</label>
                  <select
                    id="exam-class"
                    value={form.classId}
                    onChange={(e) => {
                      updateForm({ classId: e.target.value, sectionMode: "" });
                      setSubjectRows([]);
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label htmlFor="exam-section">Section</label>
                  <select
                    id="exam-section"
                    value={form.sectionMode}
                    disabled={!form.classId}
                    onChange={(e) => updateForm({ sectionMode: e.target.value })}
                  >
                    <option value="">Select Section</option>
                    <option value={ALL_SECTIONS}>All Sections</option>
                    {formSections.map((s) => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="exam-field">
                  <label htmlFor="exam-total-mark">Total Marks</label>
                  <input
                    id="exam-total-mark"
                    type="number"
                    min="1"
                    value={form.totalMark}
                    onChange={(e) => updateForm({ totalMark: e.target.value })}
                  />
                </div>
                <div className="exam-field">
                  <label htmlFor="exam-pass-mark">Pass Marks</label>
                  <input
                    id="exam-pass-mark"
                    type="number"
                    min="0"
                    value={form.passMark}
                    onChange={(e) => updateForm({ passMark: e.target.value })}
                  />
                </div>
              </div>

              <div className="exam-subject-block">
                <div className="exam-subject-head">
                  <span className="exam-subject-title">Subjects</span>
                  <button
                    type="button"
                    className="exam-subject-toggle"
                    aria-expanded={subjectPickerOpen}
                    disabled={!form.classId}
                    onClick={() => setSubjectPickerOpen((open) => !open)}
                  >
                    {subjectRows.length
                      ? `${subjectRows.length} subject${subjectRows.length > 1 ? "s" : ""} selected`
                      : "Select subjects"}
                    <i className={`bx ${subjectPickerOpen ? "bx-chevron-up" : "bx-chevron-down"}`}></i>
                  </button>
                </div>

                {subjectPickerOpen && (
                  <div className="exam-subject-grid" role="group" aria-label="Select subjects">
                    {loadingSubjects ? (
                      <span className="exam-subject-empty">Loading subjects…</span>
                    ) : subjectOptions.length === 0 ? (
                      <span className="exam-subject-empty">
                        {form.classId ? "No subjects available" : "Select a class first"}
                      </span>
                    ) : (
                      subjectOptions.map((s) => {
                        const checked = subjectRows.some(
                          (r) => String(r.subjectId) === String(s.id)
                        );
                        return (
                          <label className="exam-subject-item" key={s.id}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSubject(s)}
                            />
                            <span>{s.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}

                {subjectRows.length > 0 && (
                  <div className="exam-schedule-rows">
                    <div className="exam-schedule-row exam-schedule-head">
                      <span>Subject</span>
                      <span>Exam Date</span>
                      <span>Start Time</span>
                      <span>End Time</span>
                      <span></span>
                    </div>
                    {subjectRows.map((row) => (
                      <div className="exam-schedule-row" key={row.subjectId}>
                        <span className="exam-schedule-subject">{row.subjectName}</span>
                        <input
                          type="date"
                          aria-label={`Exam date for ${row.subjectName}`}
                          value={row.examDate}
                          onChange={(e) =>
                            updateSubjectRow(row.subjectId, { examDate: e.target.value })
                          }
                        />
                        <input
                          type="time"
                          aria-label={`Start time for ${row.subjectName}`}
                          value={row.startTime}
                          onChange={(e) =>
                            updateSubjectRow(row.subjectId, { startTime: e.target.value })
                          }
                        />
                        <input
                          type="time"
                          aria-label={`End time for ${row.subjectName}`}
                          value={row.endTime}
                          onChange={(e) =>
                            updateSubjectRow(row.subjectId, { endTime: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="exam-schedule-remove"
                          aria-label={`Remove ${row.subjectName}`}
                          onClick={() => toggleSubject({ id: row.subjectId, name: row.subjectName })}
                        >
                          <i className="bx bx-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="svc-modal-footer">
              <button type="button" className="svc-btn-cancel" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="exam-btn-submit" onClick={submitExam} disabled={saving}>
                {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Saving…</> : "Create Exam"}
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
