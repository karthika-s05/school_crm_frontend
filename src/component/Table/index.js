import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../pages/List/StudentDummyList.css";
import "./table.css";
import { getClass, getExam, getSection, getStudentlist } from "../../services/api";
import { getToken } from "../../services/auth";
import {
  TableDeleteConfirm,
  TableSelectCheckbox,
  TableSelectionToolbar,
} from "./TableSelection";
import useTableSelection from "../../hooks/useTableSelection";

const avatarColors = ["#2D3A8C", "#E8541A", "#22c55e", "#8b5cf6", "#f59e0b", "#06b6d4"];

const getInitials = (str) =>
  String(str).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const Table = (props) => {
  const data = Array.isArray(props.data) ? props.data : [];
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dropDown, setDropDown] = useState({});
  const [selectedClassId, setSelectedClassId] = useState(0);
  const { pathname } = useLocation();
  const isClassIdDropdownVisible = pathname === "/list" || pathname === "/staff";
  const [pageSize] = useState(10);
  const navigate = useNavigate();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handlePageClick = (pageNumber) => {
    setCurrentPage((prev) => {
      if (pageNumber === "prev") return Math.max(1, prev - 1);
      if (pageNumber === "next") return prev + 1;
      if (typeof pageNumber === "number") return pageNumber;
      return prev;
    });
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

  const newArray = data.map((obj) => ({ ...obj }));

  const filteredData = newArray.filter((item) => {
    const matchSearch = !search || Object.values(item).some(
      (value) => String(value).toUpperCase().includes(search.toUpperCase())
    );
    const matchClass = !selectedClassId || item.classId === parseInt(selectedClassId);
    return matchSearch && matchClass;
  });

  const computedTotalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Deleting the last row of a page leaves the view on a page that no longer
  // exists, so fall back to the last page that still holds records.
  useEffect(() => {
    if (currentPage > computedTotalPages) setCurrentPage(computedTotalPages);
  }, [currentPage, computedTotalPages]);

  const safePage = Math.min(currentPage, computedTotalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const headings = Object.keys(data[0] || {}).filter((k) => k !== "id");

  const isListPage =
    props.propsData === "Student List" || props.propsData === "Staff List";

  const showAddButton =
    props.propsData === "Exam Report List" ||
    props.propsData === "Student List" ||
    props.propsData === "Staff List";

  const getRowId = (item) => {
    if (isListPage) {
      const profileKey = profileKeyMap[props.propsData];
      return item[profileKey] ?? item.id;
    }
    return item.id;
  };

  const selection = useTableSelection({
    rows: paginatedData,
    getRowId,
    resetKey: `${props.propsData}|${search}|${selectedClassId}|${data.length}`,
  });

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

  const handleToolbarEdit = () => {
    const id = selection.singleSelectedId;
    if (!id) return;
    if (isListPage) handleEditClick(id);
    else props.onEdit?.(id);
    selection.clearSelection();
  };

  const handleConfirmBulkDelete = async () => {
    const ids = [...selection.selectedRows];
    if (!ids.length) return;
    setDeleting(true);
    try {
      if (typeof props.onBulkDelete === "function") {
        await props.onBulkDelete(ids);
      } else if (typeof props.onDelete === "function") {
        for (const id of ids) {
          // eslint-disable-next-line no-await-in-loop
          await Promise.resolve(props.onDelete(id));
        }
      }
      selection.clearSelection();
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to delete selected record(s)");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="sdl-wrap">
      <div className="sdl-header">
        <div>
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
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <TableSelectionToolbar
            selectedCount={selection.selectedCount}
            canEdit={selection.canEdit}
            canDelete={selection.canDelete && !isListPage}
            onEdit={handleToolbarEdit}
            onDelete={() => setBulkDeleteOpen(true)}
            onMessage={(msg) => toast.info(msg)}
            deleteLabel={isListPage ? "Relieve" : "Delete"}
            disabled={deleting}
          />
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
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <ul className="breadcrumb" style={{ margin: 0 }}>
          <li>
            <Link to="/dashboard" style={{ color: "#051F3E" }}>
              <h4 style={{ margin: 0 }}>Home</h4>
            </Link>
          </li>
        </ul>
      </div>

      <div className="sdl-table-card">
        <table className="sdl-table">
          <thead>
            <tr>
              <th className="sdl-th-check">
                <TableSelectCheckbox
                  checked={selection.allPageSelected}
                  indeterminate={selection.somePageSelected}
                  onChange={selection.toggleSelectAll}
                  ariaLabel="Select all rows on this page"
                  disabled={!paginatedData.length}
                />
              </th>
              {headings.map((h, i) => (
                <th key={i}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={headings.length + 1} className="sdl-empty">
                  <i className="bx bx-search-alt"></i>
                  <span>No records found</span>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => {
                const globalIdx = startIndex + rowIdx + 1;
                const rowId = getRowId(item);
                const firstVal = String(Object.values(item).find((v, i) => Object.keys(item)[i] !== "id" && v) || "?");
                const selected = selection.isSelected(rowId);

                return (
                  <tr key={rowId || rowIdx} className={selected ? "sdl-row-selected" : undefined}>
                    <td className="sdl-td-check">
                      <TableSelectCheckbox
                        checked={selected}
                        onChange={() => selection.toggleRow(rowId)}
                        ariaLabel={`Select row ${globalIdx}`}
                      />
                    </td>
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
              onClick={() => currentPage < computedTotalPages && handlePageClick("next")}
            >
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      <TableDeleteConfirm
        open={bulkDeleteOpen}
        count={selection.selectedCount}
        loading={deleting}
        onCancel={() => !deleting && setBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
};

export default Table;
