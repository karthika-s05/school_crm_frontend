import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import {
  TableSelectCheckbox,
  TableSelectionToolbar,
} from "../../component/Table/TableSelection";
import useTableSelection from "../../hooks/useTableSelection";
import {
  getExamResultlist,
  getExam,
  getClass,
  getSection,
  publishExamResult,
  unpublishExamResult,
} from "../../services/api";
import { getToken, getUserData } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";
import { toast } from "react-toastify";

const PER_PAGE = 10;
const AV_COLORS = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];
const initials = (n) =>
  (n || "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const mapResultItem = (item) => ({
  id: item.id,
  student: item.studentName,
  admNo: item.admissionNo || item.registrationNo || "-",
  examName: item.examName,
  className: item.className,
  sectionName: item.sectionName,
  subjectName: item.subjectName || "-",
  mark: item.obtainedMark ?? item.mark ?? 0,
  total: item.totalMark ?? item.total ?? 0,
  remarks: item.remarks || "-",
  result:
    item.result ||
    (Number(item.obtainedMark) >= Number(item.passMark ?? 40) ? "Pass" : "Fail"),
  isPublished: Boolean(item.isPublished),
});

export default function Examresult() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const role = String(getUserData("role") || "").toLowerCase();
  const portalBase = useMemo(() => {
    if (location.pathname.startsWith("/staff")) return "/staff";
    if (location.pathname.startsWith("/student")) return "/student";
    if (role === "staff") return "/staff";
    if (role === "student") return "/student";
    return "/admin";
  }, [location.pathname, role]);
  const subjectMarkPath = `${portalBase}/subjectmark`;
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [clsFilter, setClsFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const loadResults = useCallback(async () => {
    if (!clsFilter || !sectionFilter || !examFilter) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    await runApi(
      () =>
        getExamResultlist(
          {
            examId: parseInt(examFilter, 10),
            studentId: "All",
            classId: parseInt(clsFilter, 10),
            sectionId: parseInt(sectionFilter, 10),
          },
          token
        ),
      {
        onSuccess: (res) => {
          const list = Array.isArray(res.data) ? res.data.map(mapResultItem) : [];
          setData(list);
        },
        onError: () => setData([]),
      }
    );
    setLoading(false);
  }, [clsFilter, sectionFilter, examFilter, token]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cls, sec, examRes] = await Promise.all([
          getClass(0, token),
          getSection(0, token),
          getExam({}, token),
        ]);
        const classList = Array.isArray(cls) ? cls : [];
        const sectionList = Array.isArray(sec) ? sec : [];
        const examList = Array.isArray(examRes?.data) ? examRes.data : [];
        setClasses(classList);
        setSections(sectionList);
        setExams(examList);

        // Default to the newest exam and its own class/section so the first
        // load lands on a combination that actually has marks.
        const latestExam = examList[0];
        if (latestExam) {
          setExamFilter((prev) => prev || String(latestExam.id));
          setClsFilter((prev) => prev || String(latestExam.classId || ""));
          setSectionFilter((prev) => prev || String(latestExam.sectionId || ""));
        }
        setClsFilter((prev) => prev || (classList.length ? String(classList[0].id) : ""));
        setSectionFilter((prev) => prev || (sectionList.length ? String(sectionList[0].id) : ""));
      } catch {
        setClasses([]);
        setSections([]);
        setExams([]);
      }
    };
    loadMeta();
  }, [token]);

  useEffect(() => {
    if (clsFilter && sectionFilter && examFilter) loadResults();
  }, [clsFilter, sectionFilter, examFilter, loadResults]);

  const filteredSections = useMemo(() => {
    if (!clsFilter) return sections;
    return sections.filter((s) => {
      const cid = s.classId ?? s.class_id;
      return cid == null || String(cid) === String(clsFilter);
    });
  }, [sections, clsFilter]);

  /** Exams are created per class/section, so only offer the matching ones. */
  const filteredExams = useMemo(() => {
    if (!clsFilter || !sectionFilter) return exams;
    return exams.filter(
      (ex) =>
        String(ex.classId) === String(clsFilter) &&
        String(ex.sectionId) === String(sectionFilter)
    );
  }, [exams, clsFilter, sectionFilter]);

  useEffect(() => {
    if (!exams.length) return;
    setExamFilter((prev) => {
      if (prev && filteredExams.some((ex) => String(ex.id) === String(prev))) {
        return prev;
      }
      return filteredExams.length ? String(filteredExams[0].id) : "";
    });
  }, [filteredExams, exams.length]);

  const filtered = data.filter((item) => {
    const ms =
      item.student?.toLowerCase().includes(search.toLowerCase()) ||
      item.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
      item.admNo?.toLowerCase().includes(search.toLowerCase());
    const mr = resultFilter === "All" || item.result === resultFilter;
    return ms && mr;
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
    resetKey: `${data.length}|${search}|${resultFilter}|${clsFilter}|${sectionFilter}|${examFilter}`,
  });

  const canPublish = portalBase !== "/student";
  const allPublished = data.length > 0 && data.every((item) => item.isPublished);

  const passCount = data.filter((r) => r.result === "Pass").length;
  const failCount = data.filter((r) => r.result === "Fail").length;
  const avgMark = data.length
    ? Math.round(data.reduce((s, r) => s + (Number(r.mark) || 0), 0) / data.length)
    : 0;
  const avgTotal = data.length ? Math.max(...data.map((r) => Number(r.total) || 100)) : 100;

  const reset = () => {
    setSearch("");
    setResultFilter("All");
    setPage(1);
  };

  const handleToolbarEdit = () => {
    if (selection.selectedCount === 0) {
      toast.info("Please select a record to edit.");
      return;
    }
    if (selection.selectedCount > 1) {
      toast.info("Please select only one record to edit.");
      return;
    }
    navigate(subjectMarkPath);
  };

  const handlePublishToggle = async () => {
    if (!clsFilter || !sectionFilter || !examFilter) return;
    setPublishing(true);
    await runApi(
      () =>
        (allPublished ? unpublishExamResult : publishExamResult)(
          {
            examId: parseInt(examFilter, 10),
            classId: parseInt(clsFilter, 10),
            sectionId: parseInt(sectionFilter, 10),
          },
          token
        ),
      {
        successMsg: allPublished
          ? "Exam result moved to draft"
          : "Exam result published",
        onSuccess: () => loadResults(),
      }
    );
    setPublishing(false);
  };

  return (
    <div className="sdl-wrap">
      <ToastContainer position="bottom-right" autoClose={2500} style={{ zIndex: 99999, fontSize: 14 }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Total Records", val: data.length, icon: "bx bxs-spreadsheet", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Pass", val: passCount, icon: "bx bxs-check-circle", color: "#16a34a", bg: "#dcfce7" },
          { label: "Fail", val: failCount, icon: "bx bxs-x-circle", color: "#ef4444", bg: "#fef2f2" },
          { label: "Avg Mark", val: data.length ? `${avgMark}/${avgTotal}` : "-", icon: "bx bxs-bar-chart-alt-2", color: "#d97706", bg: "#fef3c7" },
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
            placeholder="Search student, subject, admission no…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <TableSelectionToolbar
            selectedCount={selection.selectedCount}
            canEdit={selection.canEdit}
            canDelete={false}
            hideDelete
            onEdit={handleToolbarEdit}
            onDelete={() => toast.info("Delete is not available for exam results.")}
            onMessage={(msg) => toast.info(msg)}
          />
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
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name}</option>
            ))}
          </select>
          <select
            className="svc-select"
            value={examFilter}
            onChange={(e) => {
              setExamFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Select Exam</option>
            {filteredExams.map((e) => (
              <option key={e.id} value={e.id}>{e.exam}</option>
            ))}
          </select>
          <select className="svc-select" value={resultFilter} onChange={(e) => { setResultFilter(e.target.value); setPage(1); }}>
            <option value="All">All Results</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
          {(search || resultFilter !== "All") && (
            <button className="svc-btn-cancel" onClick={reset} style={{ height: 40, padding: "0 14px", fontSize: 12 }}>
              <i className="bx bx-x"></i> Clear
            </button>
          )}
          <button className="sdl-add-btn" onClick={() => navigate(subjectMarkPath)}>
            <i className="bx bx-plus"></i> Add Marks
          </button>
          {canPublish && (
            <button
              className="sdl-add-btn"
              type="button"
              onClick={handlePublishToggle}
              disabled={publishing || !clsFilter || !sectionFilter || !examFilter || !data.length}
              style={{
                background: allPublished ? "#fff7ed" : "#ecfdf5",
                color: allPublished ? "#c2410c" : "#166534",
                border: `1px solid ${allPublished ? "#fdba74" : "#86efac"}`,
              }}
            >
              <i className={`bx ${publishing ? "bx-loader-alt bx-spin" : allPublished ? "bx-reset" : "bx-upload"}`}></i>
              {allPublished ? " Move To Draft" : " Publish"}
            </button>
          )}
        </div>
      </div>

      {canPublish && (
        <div style={{ marginBottom: 12, color: "#64748b", fontSize: 13 }}>
          Status:{" "}
          <strong style={{ color: allPublished ? "#16a34a" : "#d97706" }}>
            {data.length ? (allPublished ? "Published" : "Draft") : "No data"}
          </strong>
        </div>
      )}

      <div className="sdl-table-card">
        {loading ? (
          <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, display: "block", marginBottom: 10, color: "#2D3A8C" }}></i>
            Loading exam results…
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
                    ariaLabel="Select all results on this page"
                    disabled={!paged.length}
                  />
                </th>
                <th>Student</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Mark</th>
                <th>Total</th>
                <th>Remark</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam results found</span>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => {
                  const selected = selection.isSelected(item.id);
                  return (
                  <tr key={item.id ?? i} className={selected ? "sdl-row-selected" : undefined}>
                    <td className="sdl-td-check">
                      <TableSelectCheckbox
                        checked={selected}
                        onChange={() => selection.toggleRow(item.id)}
                        ariaLabel={`Select ${item.student}`}
                      />
                    </td>
                    <td>
                      <div className="sdl-student-cell">
                        <div className="sdl-avatar" style={{ background: AV_COLORS[(item.id || i) % AV_COLORS.length] }}>
                          {initials(item.student)}
                        </div>
                        <div>
                          <div className="sdl-name">{item.student}</div>
                          <div className="sdl-email">{item.admNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="sdl-mobile">{item.examName}</td>
                    <td><span className="sdl-class-badge">Class {item.className}-{item.sectionName}</span></td>
                    <td><span className="svc-cat-badge">{item.subjectName}</span></td>
                    <td>
                      <strong style={{ color: item.mark >= 75 ? "#16a34a" : item.mark >= 50 ? "#d97706" : "#ef4444" }}>
                        {item.mark}
                      </strong>
                    </td>
                    <td className="sdl-mobile">{item.total}</td>
                    <td className="sdl-mobile">{item.remarks}</td>
                    <td>
                      <span className={`sdl-status ${(item.result || "").toLowerCase()}`}>{item.result}</span>
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
              <button key={p} className={`sdl-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="sdl-page-btn" disabled={page === totalPgs} onClick={() => setPage((p) => p + 1)}>
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
