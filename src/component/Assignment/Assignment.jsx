import React, { useEffect, useState } from "react";
import {
  getClass,
  getExam,
  getExamResultlist,
  getExamreport,
  getSection,
  getStudentlist,
  getSubject,
  studentReport,
} from "../../services/api";
import { getToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function Assignment() {
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

    try {
      const studentDetailsResponse = await studentReport(
        {
          classId: 1,
          sectionId: 1,
          pageNo: 1,
          startDate: "2023-12-20",
          endDate: "2023-12-30",
        },
        getToken()
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
    const studentreport = async () => {
      try {
        const response = await studentReport(
          {
            classId: 1,
            sectionId: 1,
            pageNo: 1,
            startDate: "2023-12-20",
            endDate: "2023-12-30",
          },
          getToken()
        );
        const resultData = response.data.map((item) => ({
          id: item.id,
          class: item.className,
          section: item.section,
          subject: item.subject,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status,
          description: item.description,
        }));
        setData(resultData);
      } catch (err) {
      }
    };
    studentreport();
  }, []);

  return (
    <>
      {/* <h3>Assignment Report</h3> */}
      <ul className="breadcrumb" style={{ display: "flex" }}>
        <li>
          <a href="/dashboard">
            <a style={{ color: "#051F3E" }}>
              <h4>Report</h4>
            </a>
          </a>
        </li>
        <li>
          <a>Assignment Report</a>
        </li>
      </ul>
      <div className="table-container">
        <div className="table-main">
          <h3 style={{ color: "#051F3E" }}>Student Assignment Report</h3>
          <div className="form-group">
            <div className="search-input">
              <i
                className="bx bx-search"
                style={{ color: "gray"}}
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
                <th style={{ textAlign: "center" }}>TITLE</th>
                <th style={{ textAlign: "center" }}>CLASS</th>
                <th style={{ textAlign: "center" }}>SECTION</th>
                <th style={{ textAlign: "center" }}>SUBJECT</th>
                <th style={{ textAlign: "center" }}>START DATE</th>
                <th style={{ textAlign: "center" }}>END DATE</th>
                <th style={{ textAlign: "center" }}>STATUS</th>
                <th style={{ textAlign: "center" }}>DESCRIPTION</th>
                <th style={{ textAlign: "center" }}>VIEW</th>
                {/* <th style={{textAlign:"center" }}>DELETE</th> */}
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
                    <td style={{ textAlign: "center" }}>{item.title}</td>
                    <td style={{ textAlign: "center" }}>{item.class}</td>
                    <td style={{ textAlign: "center" }}>{item.section}</td>
                    <td style={{ textAlign: "center" }}>{item.subject}</td>
                    <td style={{ textAlign: "center" }}>{item.startDate}</td>
                    <td style={{ textAlign: "center" }}>{item.endDate}</td>
                    <td style={{ textAlign: "center" }}>{item.status}</td>
                    <td style={{ textAlign: "center" }}>{item.description}</td>
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

            <h3
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
                color: "rgb(5, 31, 62)",
                fontWeight: "600",
              }}
            >
              Student Assignment Report
            </h3>
            <div className="modal-dialog modal-dialog-scrollable">
              <table className="table">
                <tbody>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Title
                    </td>
                    <td>{selectedItem.title}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Class
                    </td>
                    <td>{selectedItem.class}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Section
                    </td>
                    <td>{selectedItem.section}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Subject
                    </td>
                    <td>{selectedItem.subject}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Start Date
                    </td>
                    <td>{selectedItem.startDate}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      End Date
                    </td>
                    <td>{selectedItem.endDate}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Status
                    </td>
                    <td>{selectedItem.status}</td>
                  </tr>
                  <tr>
                    <td style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}>
                      Description
                    </td>
                    <td>{selectedItem.description}</td>
                  </tr>
                </tbody>
              </table>
              <div class="btn-style" style={{justifyContent:"end"}}>
                <button class="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
