import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../List/StudentDummyList.css";
import "../services/services.css";
import "./exam.css";
import TableActionMenu from "../../component/Table/TableActionMenu";
import { getExamResultlist, getExam, getClass, getSection } from "../../services/api";
import { getToken } from "../../services/auth";
import { runApi } from "../../utils/apiHelper";

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
  admNo: item.admissionNo || item.registrationNo || "—",
  examName: item.examName,
  className: item.className,
  sectionName: item.sectionName,
  subjectName: item.subjectName || "—",
  mark: item.obtainedMark ?? item.mark ?? 0,
  total: item.totalMark ?? item.total ?? 0,
  remarks: item.remarks || "—",
  result:
    item.result ||
    (Number(item.obtainedMark) >= Number(item.passMark ?? 40) ? "Pass" : "Fail"),
});

export default function Examresult() {
  const navigate = useNavigate();
  const token = getToken();
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
        if (classList.length && !clsFilter) setClsFilter(String(classList[0].id));
        if (sectionList.length && !sectionFilter) setSectionFilter(String(sectionList[0].id));
        if (examList.length && !examFilter) setExamFilter(String(examList[0].id));
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

  const filtered = data.filter((item) => {
    const ms =
      item.student?.toLowerCase().includes(search.toLowerCase()) ||
      item.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
      item.admNo?.toLowerCase().includes(search.toLowerCase());
    const mr = resultFilter === "All" || item.result === resultFilter;
    return ms && mr;
  });

  const totalPgs = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

  return (
    <div className="sdl-wrap">
      <ToastContainer position="top-right" autoClose={2000} style={{ fontSize: "14px" }} />

      <div className="sdl-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "Total Records", val: data.length, icon: "bx bxs-spreadsheet", color: "#2D3A8C", bg: "#eef0fb" },
          { label: "Pass", val: passCount, icon: "bx bxs-check-circle", color: "#16a34a", bg: "#dcfce7" },
          { label: "Fail", val: failCount, icon: "bx bxs-x-circle", color: "#ef4444", bg: "#fef2f2" },
          { label: "Avg Mark", val: data.length ? `${avgMark}/${avgTotal}` : "—", icon: "bx bxs-bar-chart-alt-2", color: "#d97706", bg: "#fef3c7" },
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
          <select
            className="svc-select"
            value={examFilter}
            onChange={(e) => {
              setExamFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
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
          <button className="sdl-add-btn" onClick={() => navigate("/admin/subjectmark")}>
            <i className="bx bx-plus"></i> Add Marks
          </button>
        </div>
      </div>

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
                <th>#</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Mark</th>
                <th>Total</th>
                <th>Remark</th>
                <th>Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="sdl-empty">
                    <i className="bx bx-search-alt"></i>
                    <span>No exam results found</span>
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <tr key={item.id ?? i}>
                    <td className="sdl-num">{(page - 1) * PER_PAGE + i + 1}</td>
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
                    <td>
                      <TableActionMenu onEdit={() => navigate("/admin/subjectmark")} onDelete={() => {}} />
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
