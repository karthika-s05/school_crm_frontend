import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getClass,
  getSection,
  getstudentStationerys,
  getStudentlist,
  updatestudentStationerys,
} from "../../services/api";
import { STAFF_KEY, TOKEN_KEY } from "../../services/auth";
import { ToastContainer, toast } from "react-toastify";

export default function Studendstationery() {
  const [data, setData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState(0);
  const [dropDown, setDropDown] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  console.log("editedItem", editedItem);
  const openModal = (item) => {
    console.log("item", item);
    setEditedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleEdit = (itemId) => {
    console.log(`Edit item with id: ${itemId}`);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        studentId: e.target.studentId.value,
        product: e.target.product.value,
        pending: e.target.pending.value,
        issue: parseInt(e.target.issue.value),
        total: parseInt(e.target.total.value),
      };
      const response = await updatestudentStationerys(updatedData, STAFF_KEY);
      closeModal();
      GetStationerylist();
      if (response.status === "Error") {
        toast.error(response.message);
      } else if (response.status === "Success") {
        toast.success(response.message);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      setSelectedClassId(value);
    } else if (name === "sectionId") {
      setSelectedSectionId(value);
    } else {
      setEditedItem((prevItem) => ({
        ...prevItem,
        [name]: value,
      }));
    }
  };

  const GetStationerylist = async () => {
    try {
      const response = await getstudentStationerys(
        {
          userName: "0",
          classId: selectedClassId,
          sectionId: selectedSectionId,
        },
        STAFF_KEY
      );
      console.log(response.data);
      const resultData = response.data.map((item) => ({
        id: item.id,
        studentName: item.studentName,
        product: item.product,
        total: item.total,
        issue: item.issue,
        pending: item.pending,
        studentId: item.studentId,
      }));
      setOriginalData(resultData);

      setData(resultData);
      setTotalPages(Math.ceil(resultData.length / pageSize));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    GetStationerylist();
  }, [pageSize, selectedClassId, selectedSectionId]);

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
    getDropdownData(getClass, 0, "classId");
    getDropdownData(getSection, 0, "sectionId");
  }, []);
  return (
    <>
      <div className="">
        <ul class="breadcrumb" style={{ display: "flex" }}>
          <li>
            <Link to={"/studendstationery"}>
              <a style={{ color: "#051F3E" }}>
                <h4>Stationery</h4>
              </a>
            </Link>
          </li>
          <li>
            <a>Products</a>
          </li>
        </ul>
      </div>
      <div className="table-container">
        <div className="table-main">
          <h3 style={{ color: "#051F3E" }}>Stationery</h3>
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
              class="fw-btn-fill btn-gradient-add main_bg_color"
              //   onClick={handleAdd}
            >
              <i class="bx bx-plus"></i>ADD{" "}
            </button> */}
          </div>
          <select
            className="effect-1"
            style={{ marginRight: "10px", width: "120px" }}
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
            style={{ marginRight: "10px", width: "120px" }}
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
              {selectedClassId === 0 || selectedSectionId === 0 ? (
                <tr>
                  <th colSpan="11" style={{ textAlign: "center" }}>
                    Please select a class and section
                  </th>
                </tr>
              ) : (
                <tr>
                  <th style={{ textAlign: "center" }}>STUDENT</th>
                  <th style={{ textAlign: "center" }}>PRODUCT</th>
                  <th style={{ textAlign: "center" }}>PENDING</th>
                  <th style={{ textAlign: "center" }}>ISSUE</th>
                  <th style={{ textAlign: "center" }}>TODAL</th>
                  <th style={{ textAlign: "center" }}>EDIT</th>
                  <th style={{ textAlign: "center" }}>DELETE</th>
                </tr>
              )}
            </thead>
            <tbody>
              {data
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: "center" }}>{item.studentName}</td>
                    <td style={{ textAlign: "center" }}>{item.product}</td>
                    <td style={{ textAlign: "center" }}>{item.pending}</td>
                    <td style={{ textAlign: "center" }}>{item.issue}</td>
                    <td style={{ textAlign: "center" }}>{item.total}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        class="edit-button"
                        onClick={() => {
                          handleEdit(item.id);
                          openModal(item);
                        }}
                      >
                        <i class='bx bxs-edit'></i>
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button class="delete-button">
                        <i class="bx bxs-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <span class="modal-close">
                  <i
                    class="bx bxs-x-circle"
                    style={{ fontSize: "25px", color: "gray" }}
                    onClick={closeModal}
                  ></i>
                </span>
                <div class="app-container">
                  <h1
                    class="header-model"
                    style={{ color: "rgb(5, 31, 62)", fontWeight: "600" }}
                  >
                    Update Stationery
                  </h1>
                  <form onSubmit={handleUpdate}>
                    <div class="modal-scroll-content">
                      <div class="input-container">
                        <label
                          class="input-label"
                          style={{ color: "rgb(5, 31, 62)" }}
                        >
                          Student
                        </label>
                        <select
                          className="effect-1"
                          name="studentId"
                          onChange={handleInputChange}
                          value={editedItem ? editedItem.studentId : ""}
                        >
                          <option value="">Select student</option>
                          {dropDown["studentId"] &&
                            dropDown["studentId"].map((option, index) => (
                              <option key={index} value={option.id}>
                                {option.value}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div class="input-container">
                        <label
                          class="input-label"
                          style={{ color: "rgb(5, 31, 62)" }}
                        >
                          Product
                        </label>
                        <input
                          class="effect-1"
                          type="text"
                          name="product"
                          value={editedItem ? editedItem.product : ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div class="input-container">
                        <label
                          class="input-label"
                          style={{ color: "rgb(5, 31, 62)" }}
                        >
                          pending
                        </label>
                        <input
                          class="effect-1"
                          type="number"
                          name="pending"
                          value={editedItem ? editedItem.pending : ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div class="input-container">
                        <label
                          class="input-label"
                          style={{ color: "rgb(5, 31, 62)" }}
                        >
                          Issue
                        </label>
                        <input
                          class="effect-1"
                          type="number"
                          name="issue"
                          value={editedItem ? editedItem.issue : ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div class="input-container">
                        <label
                          class="input-label"
                          style={{ color: "rgb(5, 31, 62)" }}
                        >
                          Todal
                        </label>
                        <input
                          class="effect-1"
                          type="number"
                          name="total"
                          value={editedItem ? editedItem.total : ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div class="btn-style">
                      <button class="cancel-button" onClick={closeModal}>
                        Cancel
                      </button>
                      &nbsp;&nbsp;
                      <button class="custom-button">Update</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
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
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ fontSize: "14px" }} 
        />
      </div>
    </>
  );
}
