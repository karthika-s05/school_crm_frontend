import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./table.css";
import {
  getClass,
  getExam,
  getSection,
  getStudentlist,
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";

const Table = (props) => {
  const data = props.data;
  console.log(data, "0987654");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteKey, setDeleteKey] = useState(1);
  const [search, setSearch] = useState();
  const [dropDown, setDropDown] = useState({});
  const [selectedClassId, setSelectedClassId] = useState(0);
  const { pathname } = useLocation();
  const isClassIdDropdownVisible =
    pathname === "/list" || pathname === "/staff";
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    const getDropdownData = async (funcName, id, name) => {
      try {
        const response = await funcName(id, TOKEN_KEY);
        const data = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          [name]: data,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    const getStudent = async () => {
      try {
        const response = await getStudentlist({ userName: 0 }, TOKEN_KEY);
        console.log(response);
        const studentlist = response.data.map((value, index) => ({
          id: value.admissionNo,
          value: value.studentName,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          studentId: studentlist,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getStudent();
    const getExamstaffExam1 = async () => {
      try {
        const response = await getExam({}, STAFF_KEY);
        const examName = response.data.map((value, index) => ({
          id: value.id,
          value: value.exam,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          examId: examName,
        }));
      } catch (err) {
        console.log(err);
      }
    };
    getExamstaffExam1();
    if (
      isClassIdDropdownVisible &&
      (pathname === "/list" || pathname === "/staff") &&
      (props.propsData === "Exam Result" || props.propsData === "Student List")
    ) {
      getDropdownData(getClass, 0, "classId");
      getDropdownData(getSection, 0, "sectionId");
      getDropdownData(getStudentlist, 0, "studentId");
    }
  }, [isClassIdDropdownVisible, pathname, props.propsData]);

  useEffect(() => {
    setTotalPages(Math.ceil(data.length / pageSize));
  }, [data, pageSize]);

  useEffect(() => {
    setDeleteConfirmation(false)
  }, [props.data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      setSelectedClassId(value);
    }
    fetchStudentList();
  };
  const fetchStudentList = async () => {
    try {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const response = await getStudentlist(
        startIndex,
        endIndex,
        TOKEN_KEY,
        selectedClassId
      );
      props.setData(response);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const isDataAboveTen = data.length > 10;
  const renderPaginationButtons = () => {
    const maxButtonsToShow = 3;
    const buttons = [];
    if (totalPages <= maxButtonsToShow) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxButtonsToShow / 2)
      );
      const endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

      if (startPage > 1) {
        buttons.push(1);

        if (startPage > 2) {
          buttons.push("...");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push("...");
        }

        buttons.push(totalPages);
      }
    }
    return buttons.map((pageNumber, index) => (
      <button
        key={index}
        onClick={() => handlePageClick(pageNumber)}
        className={`pagination-button ${
          currentPage === pageNumber ? "active-page" : ""
        }`}
      >
        {pageNumber === "..." ? "..." : pageNumber}
      </button>
    ));
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (pageNumber === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (
      typeof pageNumber === "number" &&
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  };

  let action = <i class="bx  bx-show-alt" style={{ color: "gray" }}></i>;

  const newArray = data.map((obj) => {
    return {
      ...obj,
      Action: action,
    };
  });
  console.log(props.propsData);
  console.log(props);
  const renderTableHeader = (data) => {
    const headings = Object.keys(data[0] || {});
    return (
      <thead>
        <tr>
          {headings.map((heading, index) =>
            index === 0 ? (
              ""
            ) : (
              <th key={index} style={{ textAlign: "left" }}>
                {heading.toUpperCase()}
              </th>
            )
          )}
        </tr>
      </thead>
    );
  };
  const createTableRows = (data) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const filteredData = data
      .filter((item) =>
        Object.values(item).some(
          (value) =>
            (search
              ? value.toString().toUpperCase().includes(search.toUpperCase())
              : true) &&
            (selectedClassId
              ? item.classId === parseInt(selectedClassId)
              : true)
        )
      )
      .slice(startIndex, endIndex);

    const tableRows = [];

    filteredData.forEach((item) => {
      const profileKeyMap = {
        "Student List": "admission No",
        "Staff List": "staff Id",
      };

      const profileKey = profileKeyMap[props.propsData];
      console.log("sjkgfasdfjk", item);
      const columns = [];
      for (const key in item) {
        if (key === "image") {
          columns.push(
            <td key={key} style={{ textAlign: "center" }}>
              <img className="image" alt="" src={item[key]} />
            </td>
          );
        } else if (key === "Action") {
          columns.push(
            <>
              <td key={key} style={{ width: "100px",textAlign:'center' }}>
                <div style={{ textAlign: "center" }} className="view-delete">
                  {props.propsData === "Student List" ||
                  props.propsData === "Staff List" ? (
                    <>
                      <button className="view-button">
                        <Link
                          to={`/profile/${item[profileKey]}`}
                          state={props.propsData}
                        >
                          <button className="view-button">{item[key]}</button>
                        </Link>
                      </button>
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(item[profileKey])}
                      >
                        <i className="bx bxs-edit"></i>
                      </button>
                      <button
                        className="view-button"
                        style={{color:"red"}}
                        onClick={() => navigate(`/releiving/${item[profileKey]}`, { state: props.propsData=='Student List'?"Student Relieving":"Staff Relieving"})}

                      >
                       <i class='bx bx-user-x'></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => props.onEdit(item["id"])}
                      >
                        <i className="bx bxs-edit"></i>
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => {
                          setDeleteKey(item["id"]);
                          setDeleteConfirmation(true);
                        }}
                      >
                        <i className="bx bxs-trash"></i>
                      </button>
                    </>
                  )}
                </div>
                {deleteConfirmation && (
                  <div className="modal-overlays">
                    <div className="modal-content" style={{ width: "280px" }}>
                      <div
                        className="app-container"
                        style={{ marginRight: "-7px" }}
                      >
                        <p
                          style={{
                            textAlign: "center",
                            color: "rgb(5, 31, 62)",
                            fontWeight: "500",
                            fontSize: "14px",
                            display: "flex",
                            justifyContent: "center",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <i
                            className="fa fa-exclamation-circle"
                            style={{ fontSize: "20px", color: "#ff0000b3" }}
                          >
                            {" "}
                          </i>
                          Are you sure you want to delete?
                        </p>
                        <div
                          className="btn-style"
                          style={{ marginTop: "20px", gap: "3px" }}
                        >
                          <button
                            className="custom-button"
                            style={{
                              width: "60px",
                              height: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => {
                              console.log(item["id"], "id");
                              props.onDelete(deleteKey);
                              setDeleteConfirmation(false);
                            }}
                          >
                            Yes
                          </button>
                          &nbsp;&nbsp;
                          <button
                            className="cancel-button"
                            style={{
                              width: "50px",
                              height: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
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
            </>
          );
        } else {
          columns.push(
            <td key={key} style={{ textAlign: "left" }}>
              {item[key]}
            </td>
          );
        }
      }
      columns.shift();
      tableRows.push(<tr key={item.id}>{columns}</tr>);
    });

    return tableRows;
  };
  const handleClick = () => {
    let url = '';
    if (props.propsData === "Exam Report List") {
      url = "/exam";
    } else if (props.propsData === "Student List") {
      url = "/studentlist/:id";
    } else if (props.propsData === "Staff List") {
      url = "/stafflist/:id";
    }

    navigate(url);
  };
  const handleFileClicks = (id) => {
    navigate(`/studentinfo/${id}`);
}
  const handleEditClick = (id) => {
    const url = props.propsData === "Student List" ? "/studentlist" : "/stafflist";
    navigate(`${url}/${id}`);
  };
  const [isFocused, setIsFocused] = useState(false);
  const handleInputFocus = () => {
    setIsFocused(true);
  };
  const handleInputBlur = () => {
    setIsFocused(false);
  };
  return (
    <>
      <div className="table-main">
        <ul
          class="breadcrumb"
          style={{ display: "flex", alignItems: "center" }}
        >
          <li>
            <Link to={"/dashboard"}>
              <a style={{ color: "#051F3E" }}>
                <h4>Home</h4>
              </a>
            </Link>
          </li>
          <li>
            <a>{props.propsData} </a>
          </li>
        </ul>
        <span
          class="horizontal-line"
          style={{ background: "#F0F1F3", marginTop: "20px" }}
        ></span>
        <div class="form-group" style={{ marginTop: "-38px" }}>
          <div
            className="search-input"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{
              border: isFocused
                ? "2px solid #9cc9e7"
                : "1px solid rgb(207, 207, 207)",
            }}
          >
            <i
              class="bx bx-search"
              style={{ padding: "10px", color: "gray", marginLeft: "-30px" }}
            ></i>
            <input
              type="text"
              placeholder="Search..."
              class="form-control"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {props.propsData == "Exam Report List" || props.propsData == "Student List" || props.propsData == "Staff List" ? (
            <button
              type="submit"
              class="fw-btn-fill btn-gradient-add"
              onClick={handleClick}
            >
              <i class="bx bx-plus"></i>ADD{" "}
            </button>
          ) : (
            <button
              type="submit"
              class="fw-btn-fill btn-gradient-add"
              onClick={props.openModal}
            >
              <i class="bx bx-plus"></i>ADD{" "}
            </button>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {newArray.length === 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th
                    colSpan="11"
                    style={{ textAlign: "center", fontSize: "14px" }}
                  >
                    No data available.
                  </th>
                </tr>
              </thead>
            </table>
          ) : (
            <table className="table">
              {renderTableHeader(newArray)}
              {createTableRows(newArray)}
            </table>
          )}
        </div>
        {isDataAboveTen && (
          <div className="pagination">
            {currentPage > 1 && (
              <a onClick={() => handlePageClick("prev")}>&laquo; Prev</a>
            )}
            {renderPaginationButtons()}
            {currentPage < totalPages && (
              <a onClick={() => handlePageClick("next")}>Next &raquo;</a>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const SelectField = ({ data, dropDown, handleInputChange }) => {
  return (
    <>
      <div>
        <label className="input-label"></label>
        <select
          className="effect-2"
          name={data.name}
          value={data.value}
          onChange={handleInputChange}
        >
          {data.value ? (
            <option value={data.value}>{data.value}</option>
          ) : (
            <option value="">Class</option>
          )}
          {dropDown[data.name] &&
            dropDown[data.name].map((option, index) => (
              <option key={index} value={option.id}>
                {option.value}
              </option>
            ))}
        </select>
      </div>
    </>
  );
};

export default Table;
