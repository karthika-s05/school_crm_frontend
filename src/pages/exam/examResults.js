import React, { useEffect, useState } from "react";
import {
  getClass,
  getExam,
  getExamreport,
  getSection,
  getStudentlist,
  getSubject,
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import '../exam/exam.css'
const Examresult = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [dropDown, setDropDown] = useState({});
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState(0);
  const [selectedExamId, setSelectedExamId] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState("All");

  const handleAdd = () => {
    navigate("/exam");
  };

  const handleEdit = () => {
    navigate("/exam");
  };

  useEffect(() => {
    const getExamreportlist = async () => {
      try {
        const response = await getExamreport(
          {
            examId: selectedExamId,
            studentId: selectedStudentId,
            classId: selectedClassId,
            sectionId: selectedSectionId,
          },
          STAFF_KEY
        );

        const resultData = response.data[0].map((item) => ({
          id: item.id,
          student: item.studentName,
          examName: item.examName,
          className: item.className,
          mark: item.mark,
          result: item.result,
          sectionName: item.sectionName,
          subjectName: item.subjectName,
          remarks: item.remarks,
          total: item.total,
        }));
        setOriginalData(resultData);
        setData(resultData);
        setTotalPages(Math.ceil(resultData.length / pageSize));
      } catch (err) {
        console.log(err);
      }
    };

    getExamreportlist();
  }, [
    pageSize,
    selectedClassId,
    selectedSectionId,
    selectedExamId,
    selectedStudentId,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      setSelectedClassId(value);
    } else if (name === "sectionId") {
      setSelectedSectionId(value);
    } else if (name === "examId") {
      setSelectedExamId(value);
    } else if (name === "studentId") {
      setSelectedStudentId(value);
    }
  };

  useEffect(() => {
    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) =>
        search
          ? value.toString().toUpperCase().includes(search.toUpperCase())
          : true
      )
    );

    setTotalPages(Math.ceil(filteredData.length / pageSize));
    setData(search ? filteredData : originalData);
  }, [search, pageSize, originalData]);

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
    const getStudent = async () => {
      try {
        const response = await getStudentlist({userName:0}, TOKEN_KEY);
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
    const getSubject1 = async () => {
      try {
        const response = await getSubject(0, TOKEN_KEY);
        const subjects = response.map((value, index) => ({
          id: value.id,
          value: value.name,
        }));
        setDropDown((prevData) => ({
          ...prevData,
          subjectId: subjects,
        }));
      } catch (err) {
        console.log(err);
      }
    };
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
    getStudent();
    getSubject1();
    getExamstaffExam1();
    getDropdownData(getClass, 0, "classId");
    getDropdownData(getSection, 0, "sectionId");
  }, []);
  return (
    <div>
      {/* <h3>Exam Result</h3> */}
      <ul class="breadcrumb" style={{display:'flex'}}>
        <li>
          <a href="/dashboard">
            <a style={{color: "#051F3E"}}><h4>Home</h4></a>
          </a>
        </li>
        <li>
          <a>Exam Result</a>
        </li>
      </ul>
      <div className="table-container">
        <div className="table-main">
          <h3 style={{color: "#051F3E"}}>Student Exam Result</h3>
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
            <button
              type="submit"
              class="fw-btn-fill btn-gradient-add"
              onClick={handleAdd}
            >
              <i class="bx bx-plus"></i>ADD{" "}
            </button>
          </div>
          <div>
            <select
              className="effect-1"
              style={{ marginRight: "10px",width:'120px' }}
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
              style={{ marginRight: "10px",width:'120px' }}
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
            <select
              className="effect-1"
              style={{ marginRight: "10px",width:'120px' }}
              name="examId"
              value={selectedExamId}
              onChange={handleInputChange}
            >
              <option value="">Exam</option>
              {dropDown["examId"] &&
                dropDown["examId"].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.value}
                  </option>
                ))}
            </select>
            <select
              className="effect-1"
              name="studentId"
              // style={{ marginRight: "10px",width:'120px' }}
              value={selectedStudentId}
              onChange={handleInputChange}
            >
              <option value="">Student</option>
              {dropDown["studentId"] &&
                dropDown["studentId"].map((option, index) => (
                  <option key={index} value={option.id}>
                    {option.value}
                  </option>
                ))}
            </select>
          </div>
          <table className="table">
            <thead>
              {selectedClassId === 0 ||
              selectedSectionId === 0 ||
              selectedExamId === 0  ? (
                <tr>
                  <th colSpan="11" style={{ textAlign: "center" }}>
                    Please select all options
                  </th>
                </tr>
              ) : (
                <tr>
                  {/* <th>ID</th> */}
                  <th>STUDENT</th>
                  <th>EXAM</th>
                  <th>CLASS</th>
                  <th>SECTION</th>
                  <th>SUBJECT</th>
                  <th>MARK</th>
                  <th>REMARK</th>
                  <th>TOTAL</th>
                  <th>RESULT</th>
                  {/* <th style={{ textAlign: "center" }}>EDIT</th> */}
                  <th style={{ textAlign: "center" }}>DELETE</th>
                </tr>
              )}
            </thead>
            <tbody>
              {data
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.student}</td>
                    <td>{item.examName}</td>
                    <td>{item.className}</td>
                    <td>{item.sectionName}</td>
                    <td>{item.subjectName}</td>
                    <td>{item.mark}</td>
                    <td>{item.remarks}</td>
                    <td>{item.total}</td>
                    <td>{item.result}</td>
                    {/* <td style={{ textAlign: "center" }}>
                      <button
                        class="edit-button"
                        onClick={() => handleEdit(item.id)}
                      >
                        <i class="bx bxs-pencil"></i>
                      </button>
                    </td> */}
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
  );
};

export default Examresult;
