import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  getClass,
  getExam,
  getSection,
  getStudentlist,
  getSubject,
  getViewAttendance,
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";

export default function ViewAttendance() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dropDown, setDropDown] = useState({});
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState(0);

  const handleAdd = () => {
    navigate("/studentattendence");
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "examDate") {
      setSelectedDate(value);
    } else if (name === "classId") {
      setSelectedClassId(value);
    } else if (name === "sectionId") {
      setSelectedSectionId(value);
    }
  };
  useEffect(() => {
    const getExamreportlist = async () => {
      try {
        const response = await getViewAttendance(
          {
            classId: selectedClassId,
            sectionId: selectedSectionId,
            studentId: "All",
            reqDate: selectedDate,
          },
          STAFF_KEY
        );

        const resultData = response.data.map((item) => ({
          id: item.id,
          student: item.studentName,
          status: item.status,
          className: item.className,
          mark: item.mark,
        }));
        setOriginalData(resultData);
        setData(resultData);
        setTotalPages(Math.ceil(resultData.length / pageSize));
        
      } catch (err) {
        console.log(err);
      }
    };
    getExamreportlist();
  }, [pageSize, selectedDate, selectedSectionId, selectedClassId]);

  useEffect(() => {
    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) =>
        search
          ? valueToString(value).toUpperCase().includes(search.toUpperCase())
          : true
      )
    );

    setTotalPages(Math.ceil(filteredData.length / pageSize));
    setData(search ? filteredData : originalData);
  }, [search, pageSize, originalData]);

  const valueToString = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    return value.toString();
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
        Math.min(
          currentPage - Math.floor(maxButtonsToShow / 2),
          totalPages - maxButtonsToShow + 1
        )
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

    getDropdownData(getClass, 0, "classId");
    getDropdownData(getSection, 0, "sectionId");
  }, []);
  return (
    <>
      <div>
        <ul class="breadcrumb" style={{ display: "flex" }}>
          <li>
            <Link to={"/studentattendence"}>
              <a style={{ color: "#051F3E" }}>
                <h4>Student</h4>
              </a>
            </Link>
          </li>
          <li>
            <a>View Attendence</a>
          </li>
        </ul>
        <div className="table-container">
          <div className="table-main">
            <h3 style={{ color: "#051F3E" }}>View Attendance</h3>
            <div class="form-group">
              <div class="search-input">
                <i
                  class="bx bx-search"
                  style={{ padding: "10px", color: "gray",marginLeft:'-30px' }}
                ></i>
                <input
                  type="text"
                  placeholder="Search..."
                  class="form-control"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* <button 
                type="submit"
                class="fw-btn-fill btn-gradient-add"
                onClick={handleAdd}
              >
                <i class="bx bx-plus"></i>ADD{" "}
              </button> */}
            </div>
            <input
              className="effect-1"
              type="date"
              name="examDate"
              value={selectedDate}
              onChange={handleInputChange}
            />
            <select
              className="effect-1"
              style={{ marginLeft: "10px", width: "120px" }}
              name="classId"
              value={selectedClassId}
              onChange={handleInputChange}
            >
              <option value="">Class</option>
              {dropDown["classId"] &&
                dropDown["classId"].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.value}
                  </option>
                ))}
            </select>
            <select
              className="effect-1"
              style={{ marginLeft: "10px", width: "120px" }}
              name="sectionId"
              value={selectedSectionId}
              onChange={handleInputChange}
            >
              <option value="">Section</option>
              {dropDown["sectionId"] &&
                dropDown["sectionId"].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.value}
                  </option>
                ))}
            </select>
            <table className="table">
              <thead>
                {selectedDate === "" ? (
                  <tr>
                    <th colSpan="11" style={{ textAlign: "center" }}>
                      Please select a date
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th style={{ textAlign: "center" }}>No</th>
                    <th>STUDENT</th>
                    <th style={{ textAlign: "center" }}>STATUS</th>
                    <th style={{ textAlign: "center" }}>DELETE</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {data
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{item.student}</td>
                      <td style={{ textAlign: "center" }}>{item.status}</td>

                      <td style={{ textAlign: "center" }}>
                        <button class="delete-button">
                          <i class="bx bxs-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="pagination">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageClick("prev")}
                  disabled={currentPage === 1}
                >
                  &laquo; Prev
                </button>
              )}
              {renderPaginationButtons()}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageClick("next")}
                  disabled={currentPage === totalPages}
                >
                  Next &raquo;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
