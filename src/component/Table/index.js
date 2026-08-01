import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../pages/List/StudentDummyList.css";
import "./table.css";
import { getClass, getExam, getSection, getStudentlist } from "../../services/api";
import { getToken } from "../../services/auth";
import TableActionMenu from "./TableActionMenu";

const avatarColors = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];

const getInitials = (str) =>
  String(str).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const Table = (props) => {
  const data = Array.isArray(props.data) ? props.data : [];
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteKey, setDeleteKey] = useState(null);
  const [search, setSearch] = useState("");
  const [dropDown, setDropDown] = useState({});
  const [selectedClassId, setSelectedClassId] = useState(0);
  const { pathname } = useLocation();
  const isClassIdDropdownVisible = pathname === "/list" || pathname === "/staff";
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    const getDropdownData = async (funcName, id, name) => {
      try {
        const response = await funcName(id, getToken());
        const d = response.map((v) => ({ id: v.id, value: v.name }));
        setDropDown((prev) => ({ ...prev, [name]: d }));
      } catch (err) { console.log(err); }
    };
    const getStudent = async () => {
      try {
        const response = await getStudentlist({ userName: 0 }, getToken());
        const list = response.data.map((v) => ({ id: v.admissionNo, value: v.studentName }));
        setDropDown((prev) => ({ ...prev, studentId: list }));
      } catch (err) { console.log(err); }
    };
    const getExamData = async () => {
      try {
        const response = await getExam({}, getToken());
        const exams = response.data.map((v) => ({ id: v.id, value: v.exam }));
        setDropDown((prev) => ({ ...prev, examId: exams }));
      } catch (err) { console.log(err); }
    };
    getStudent();
    getExamData();
    if (isClassIdDropdownVisible &&
      (props.propsData === "Exam Result" || props.propsData === "Student List")) {
      getDropdownData(getClass, 0, "classId");
      getDropdownData(getSection, 0, "sectionId");
    }
  }, [isClassIdDropdownVisible, pathname, props.propsData]);

  useEffect(() => {
    setTotalPages(Math.ceil(data.length / pageSize));
  }, [data, pageSize]);

  useEffect(() => {
    setDeleteConfirmation(false);
  }, [props.data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") setSelectedClassId(value);
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber === "prev" && currentPage > 1) setCurrentPage(currentPage - 1);
    else if (pageNumber === "next" && currentPage < totalPages) setCurrentPage(currentPage + 1);
    else if (typeof pageNumber === "number") setCurrentPage(pageNumber);
  };

  const handleClick = () => {
    const urls = {
      "Exam Report List": "/exam",
      "Student List": "/admin/student/new",
      "Staff List": "/admin/staff/new",
    };
    navigate(urls[props.propsData] || "/");
  };

  const handleEditClick = (id) => {
    const url = props.propsData === "Student List" ? "/admin/student" : "/admin/staff";
    navigate(`${url}/${id}`);
  };

  const profileKeyMap = { "Student List": "admission No", "Staff List": "staff Id" };

  const handleViewClick = (item) => {
    const profileKey = profileKeyMap[props.propsData];
    const id = item[profileKey];
    if (props.propsData === "Student List") {
      navigate(`/admin/studentinfo/${id}`);
    } else if (props.propsData === "Staff List") {
      navigate(`/admin/profile/${id}`, { state: "Staff List" });
    }
  };

  // Build filtered + paginated rows
  const newArray = data.map((obj) => ({ ...obj }));

  const filteredData = newArray.filter((item) => {
    const matchSearch = !search || Object.values(item).some(
      (value) => String(value).toUpperCase().includes(search.toUpperCase())
    );
    const matchClass = !selectedClassId || item.classId === parseInt(selectedClassId);
    return matchSearch && matchClass;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const computedTotalPages = Math.ceil(filteredData.length / pageSize);

  const headings = Object.keys(data[0] || {}).filter((k) => k !== "id");

  const isListPage =
    props.propsData === "Student List" || props.propsData === "Staff List";

  const showAddButton =
    props.propsData === "Exam Report List" ||
    props.propsData === "Student List" ||
    props.propsData === "Staff List";

  // Pagination buttons
  const renderPageButtons = () => {
    const maxShow = 3;
    const buttons = [];
    if (computedTotalPages <= maxShow) {
      for (let i = 1; i <= computedTotalPages; i++) buttons.push(i);
    } else {
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(start + maxShow - 1, computedTotalPages);
      if (start > 1) { buttons.push(1); if (start > 2) buttons.push("..."); }
      for (let i = start; i <= end; i++) buttons.push(i);
      if (end < computedTotalPages) {
        if (end < computedTotalPages - 1) buttons.push("...");
        buttons.push(computedTotalPages);
      }
    }
    return buttons;
  };

  return (
    <div className="sdl-wrap">
      {/* Header */}
      <div className="sdl-header">
        <div>
          {/* <h2 className="sdl-title">{props.propsData}</h2> */}
          {/* <p className="sdl-sub">
            Total <strong>{filteredData.length}</strong> records found
          </p> */}
           <div className="sdl-search">
          <i className="bx bx-search"></i>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          {search && (
            <i
              className="bx bx-x sdl-search-clear"
              onClick={() => { setSearch(""); setCurrentPage(1); }}
            />
          )}
        </div>
        </div>
        {showAddButton ? (
          <button className="sdl-add-btn" onClick={handleClick}>
            <i className="bx bx-plus"></i> Add
          </button>
        ) : (
          <button className="sdl-add-btn" onClick={props.openModal}>
            <i className="bx bx-plus"></i> Add
          </button>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <ul className="breadcrumb" style={{ margin: 0 }}>
          <li>
            <Link to="/dashboard" style={{ color: "#051F3E" }}>
              <h4 style={{ margin: 0 }}>Home</h4>
            </Link>
          </li>
          {/* <li><a>{props.propsData}</a></li> */}
        </ul>
      </div>

      {/* Table */}
      <div className="sdl-table-card">
        <table className="sdl-table">
          <thead>
            <tr>
              <th>#</th>
              {headings.map((h, i) => (
                <th key={i}>{h.toUpperCase()}</th>
              ))}
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={headings.length + 2} className="sdl-empty">
                  <i className="bx bx-search-alt"></i>
                  <span>No records found</span>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => {
                const profileKey = profileKeyMap[props.propsData];
                const globalIdx = startIndex + rowIdx + 1;
                // Pick first text column for avatar initials
                const firstVal = String(Object.values(item).find((v, i) => Object.keys(item)[i] !== "id" && v) || "?");

                return (
                  <tr key={item.id || rowIdx}>
                    <td className="sdl-num">{globalIdx}</td>
                    {headings.map((key, colIdx) => {
                      const val = item[key];
                      if (key === "image") {
                        return (
                          <td key={key}>
                            <div className="sdl-student-cell">
                              <div
                                className="sdl-avatar"
                                style={{ background: avatarColors[rowIdx % avatarColors.length] }}
                              >
                                {getInitials(firstVal)}
                              </div>
                              <img
                                style={{ height: 32, width: 32, borderRadius: "50%", objectFit: "cover" }}
                                src={val}
                                alt=""
                              />
                            </div>
                          </td>
                        );
                      }
                      // First real column gets avatar treatment for list pages
                      if (colIdx === 0 && isListPage) {
                        return (
                          <td key={key}>
                            <div className="sdl-student-cell">
                              <div
                                className="sdl-avatar"
                                style={{ background: avatarColors[rowIdx % avatarColors.length] }}
                              >
                                {getInitials(String(val || "?"))}
                              </div>
                              <div>
                                <div className="sdl-name">{val}</div>
                              </div>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={key} style={{ textAlign: "left" }}>
                          {val}
                        </td>
                      );
                    })}
                    {/* Action column */}
                    <td>
                      <TableActionMenu
                        onView={isListPage ? () => handleViewClick(item) : undefined}
                        onEdit={isListPage
                          ? () => handleEditClick(item[profileKey])
                          : () => props.onEdit(item["id"])}
                        onDelete={isListPage
                          ? () => navigate(`/releiving/${item[profileKey]}`, {
                              state: props.propsData === "Student List" ? "Student Relieving" : "Staff Relieving",
                            })
                          : () => { setDeleteKey(item["id"]); setDeleteConfirmation(true); }}
                        deleteLabel={isListPage ? "Relieve" : "Delete"}
                      />

                      {/* Delete confirmation modal */}
                      {deleteConfirmation && deleteKey === item["id"] && (
                        <div className="modal-overlays">
                          <div className="modal-content" style={{ width: "280px" }}>
                            <div className="app-container" style={{ marginRight: "-7px" }}>
                              <p style={{
                                textAlign: "center", color: "rgb(5,31,62)",
                                fontWeight: "500", fontSize: "14px",
                                display: "flex", justifyContent: "center",
                                gap: "5px", alignItems: "center"
                              }}>
                                <i className="fa fa-exclamation-circle" style={{ fontSize: "20px", color: "#ff0000b3" }}></i>
                                Are you sure you want to delete?
                              </p>
                              <div className="btn-style" style={{ marginTop: "20px", gap: "3px" }}>
                                <button
                                  className="custom-button"
                                  style={{ width: "60px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  onClick={() => { props.onDelete(deleteKey); setDeleteConfirmation(false); }}
                                >
                                  Yes
                                </button>
                                &nbsp;&nbsp;
                                <button
                                  className="cancel-button"
                                  style={{ width: "50px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  onClick={() => setDeleteConfirmation(false)}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > pageSize && (
        <div className="sdl-pagination">
          <span className="sdl-page-info">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="sdl-page-btns">
            <button
              className="sdl-page-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageClick("prev")}
            >
              <i className="bx bx-chevron-left"></i>
            </button>
            {renderPageButtons().map((p, i) => (
              <button
                key={i}
                className={`sdl-page-btn${currentPage === p ? " active" : ""}`}
                onClick={() => typeof p === "number" && handlePageClick(p)}
                disabled={p === "..."}
              >
                {p}
              </button>
            ))}
            <button
              className="sdl-page-btn"
              disabled={currentPage === computedTotalPages}
              onClick={() => handlePageClick("next")}
            >
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
