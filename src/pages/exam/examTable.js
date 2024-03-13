import React, { useEffect, useState } from "react";
import {
  getClass,
  getExam,
  getExamResultlist,
  getExamreport,
  getSection,
  getStudentlist,
  getSubject,
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function ExamTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const totalPages = Math.ceil(data.length / pageSize);

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

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleView = async (item) => {
    console.log(item);

    try {
      const studentDetailsResponse = await getExamResultlist(
        { examId: 1, studentId: "KST100001", classId: 1, sectionId: 1 },
        TOKEN_KEY
      );

      const studentDetails = studentDetailsResponse.data;

      const combinedData = {
        ...item,
        studentDetails,
      };

      openModal(combinedData);
    } catch (error) {
      console.error("Error fetching student details", error);
    }
  };

  useEffect(() => {
    const getExamreportlist = async () => {
      try {
        const response = await getExamResultlist(
          { examId: 1, studentId: "All", classId: 1, sectionId: 1 },
          STAFF_KEY
        );
        const resultData = response.data.map((item) => ({
          id: item.id,
          student: item.studentName,
          exam: item.examName,
          class: item.className,
          section: item.sectionName,
          grade: item.grade,
          mark: item.obtainedMark,
          total: item.totalMark,
          rank: item.rank,
          remarks: item.remarks,
        }));
        setData(resultData);
      } catch (err) {
        console.log(err);
      }
    };

    getExamreportlist();
  }, []);

  return (
    <>
      {/* <h3>Exam Report</h3> */}
      <ul className="breadcrumb" style={{display:'flex'}}>
        <li>
          <a href="/dashboard">
            <a style={{color: "#051F3E" }}><h4>Report</h4></a>
          </a>
        </li>
        <li>
          <a>Exam Report</a>
        </li>
      </ul>
      <div className="table-container">
        <div className="table-main">
          <h3 style={{color: "#051F3E" }}>Student Exam Report</h3>
          <div className="form-group">
            <div className="search-input">
              <i
                className="bx bx-search"
                style={{ padding: "10px", color: "gray",marginLeft:'-30px' }}
              ></i>
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="fw-btn-fill btn-gradient-add"
              //   onClick={handleAdd}
            >
              <i className="bx bx-plus"></i>ADD{" "}
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{textAlign:"center" }}>STUDENT</th>
                <th style={{textAlign:"center" }}>EXAM</th>
                <th style={{textAlign:"center" }}>CLASS</th>
                <th style={{textAlign:"center" }}>SECTION</th>
                <th style={{textAlign:"center" }}>GRADE</th>
                <th style={{textAlign:"center" }}>TODAL</th>
                <th style={{textAlign:"center" }}>MARK</th>
                <th style={{textAlign:"center" }}>RANK</th>
                <th style={{textAlign:"center" }}>REMARK</th>
                <th style={{textAlign:"center" }}>VIEW</th>
                {/* <th>DELETE</th> */}
              </tr>
            </thead>
            <tbody>
              {data
                .filter((item) =>
                  Object.values(item)
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((item) => (
                  <tr key={item.id}>
                    <td style={{textAlign:"center" }}>{item.student}</td>
                    <td style={{textAlign:"center" }}>{item.exam}</td>
                    <td style={{textAlign:"center" }}>{item.class}</td>
                    <td style={{textAlign:"center" }}>{item.section}</td>
                    <td style={{textAlign:"center" }}>{item.grade}</td>
                    <td style={{textAlign:"center" }}>{item.total}</td>
                    <td style={{textAlign:"center" }}>{item.mark}</td>
                    <td style={{textAlign:"center" }}>{item.rank}</td>
                    <td style={{textAlign:"center" }}>{item.remarks}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        class="edit-button"
                        onClick={() => handleView(item)}
                      >
                        <i class="bx bx-show-alt"></i>
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
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              style={{ display: "flex", justifyContent: "end", color: "red" }}
              className="modal-close"
              onClick={closeModal}
            >
              <i
                class="bx bxs-x-circle"
                style={{ fontSize: "25px", color: "gray" }}
              ></i>
            </span>

            <h2
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
              Student Exam Report
            </h2>
            <div className="modal-dialog modal-dialog-scrollable">
              <table className="table">
                <tbody>
                  <tr>
                    <td>Student</td>
                    <td>{selectedItem.student}</td>
                  </tr>
                  <tr>
                    <td>Exam</td>
                    <td>{selectedItem.exam}</td>
                  </tr>
                  <tr>
                    <td>Class</td>
                    <td>{selectedItem.class}</td>
                  </tr>
                  <tr>
                    <td>Section</td>
                    <td>{selectedItem.section}</td>
                  </tr>
                  <tr>
                    <td>Grade</td>
                    <td>{selectedItem.grade}</td>
                  </tr>
                  <tr>
                    <td>Mark</td>
                    <td>{selectedItem.mark}</td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>{selectedItem.total}</td>
                  </tr>
                  <tr>
                    <td>Rank</td>
                    <td>{selectedItem.rank}</td>
                  </tr>
                  <tr>
                    <td>Remark</td>
                    <td>{selectedItem.remarks}</td>
                  </tr>
                </tbody>
                <div class="btn-style">
                  <button class="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
