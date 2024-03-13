import React, { useState } from "react";
import "./nav.css";
import Dashboard from "../../pages/dashboard";
import Master from "../../pages/master";
import Login from "../../pages/Login/index";
import Registration from "../../pages/registration/registration";
import { Routes, Route, Link } from "react-router-dom";
import { getUserData, removeToken } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import List from "../../pages/List/list";
import Profile from "../../pages/profile/profile";
import Timetable from "../../pages/Timetable/timetable.js";
import Attendence from "../Atttendence/Attendence.jsx";
import Assignment from "../Assignment/Assignment.jsx";
import Homework from "../Homework/Homework.jsx";
import Event from "../../pages/Event/Event.jsx";
import Product from "../../pages/Product/Product.jsx";
import Staff from "../../pages/staff/index.js";
import Report from "../../pages/report/report.js";
import Exam from "../../pages/exam/exam.js";
import ExamTable from "../../pages/exam/examTable.js";
import Examresult from "../../pages/exam/examResults.js";
import ViewAttendance from "../Atttendence/ViewAttendance.js";
import Studendstationery from "../stationery/Studendstationery.js";
import Adlogin from "../../pages/Login/Adlogin.js";
import Staffattendance from "../Atttendence/Staffattendance.js";
import Staffview from "../Atttendence/Staffview.js";
import Nationality from "../../pages/master/nationality/Nationality.js";
import Studendlist from "../../pages/List/Studendlist.js";
import Stafflist from "../../pages/List/Stafflist.js";
import Studentinfo from "../../pages/List/Studentinfo.js";
import Nextpage from "../../pages/List/Nextpage.js";

const Nav = () => {
  const history = useNavigate();
  const image = getUserData("image");

  const userName = getUserData("adminName") || getUserData("staffName");

  const role = getUserData("role");

  const [sidebarClosed, setSidebarClosed] = useState(false);
  const [logouts, setLogouts] = useState(false);

  const toggleSidebar = () => {
    setSidebarClosed(!sidebarClosed);
  };
  const toggleSubMenu = (e) => {
    const arrowParent = e.currentTarget.parentElement;
    arrowParent.classList.toggle("showMenu");
  };

  // const logout = () => {
  //   removeToken();
  //   history("/");
  //   window.location.reload();
  // };
  // const openLogout = () => {
  //   setLogouts(!logouts);
  // };
  const [isModalOpen, setModalOpen] = useState(false);

  const openLogout = () => {
    setModalOpen(true);
  };
  const closeLogout = () => {
    setModalOpen(false);
  };

  const logout = () => {
    removeToken();
    history("/");
    window.location.reload();
    closeLogout();
  };
  return (
    <div>
      <div className={`sidebar ${sidebarClosed ? "close" : ""}`}>
        <div className="logo-details">
          <i className="bx bxl-c-plus-plus"></i>
          <span className="logo_name">Kst School</span>
        </div>

        <ul className="nav-links" style={{marginTop:'15px'}}>
          <li>
            <a>
              <Link to={"/dashboard"}>
                <i className="bx bx-grid-alt"></i>
                <span className="link_name">Dashboard</span>
              </Link>
            </a>
            <ul className="sub-menu blank ">
              <Link to={"/dashboard"}>
                <li>
                  <a style={{ height: "10px", padding: "20px" }}>Dashboard</a>
                </li>
              </Link>
            </ul>
          </li>

          <>
            {role === "Admin" ? (
              <>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-group"></i>
                      <span className="link_name">Master</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Master</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Nationality"}>
                          Nationality
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={`/master`} state={"State"}>
                          State
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"City"}>
                          City
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"BloodGroup"}>
                          BloodGroup
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Community"}>
                          Community
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Religion"}>
                          Religion
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Subject"}>
                          Subject
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Class"}>
                          Class
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Section"}>
                          Section
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-user-check"></i>
                      <span className="link_name">Student</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Student</a>
                    </li>
                    {/* <li><a ><i class='bx bx-right-arrow-alt'></i><Link to={'/registration'} state={"Admin Registration"}>Admin Registration</Link></a></li> */}
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/list"} state={"Student List"}>
                         List
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link
                          to={"/studentlist/:id"}
                          state={"Student Registration"}
                        >
                         Registration
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/releiving"} state={"Student Relieving"}>
                         Relieving
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-user-x"></i>
                      <span className="link_name">Staff</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Staff</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/list"} state={"Staff List"}>
                           List
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/stafflist/:id"} state={"Staff Registration"}>
                           Registration
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/releiving"} state={"Staff Relieving"}>
                           Relieving
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                    <i class="fa-regular fa-calendar-check"></i>
                      <span className="link_name">Attendance</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Attendance</a>
                    </li>
                    <li>
                      <a>
                      <i class="bx bxs-pencil"></i>
                        <Link to={"/staffattendance"} state={"Staff Attendance"}>
                          Staff Attendance
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bx-group"></i>
                      <span className="link_name">Mapping</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Mapping</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Class & Section"}>
                          Class & Section
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Class Teacher"}>
                          Class Teacher
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Subject Teacher"}>
                          Subject Teacher
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-id-card"></i>
                      <span className="link_name">Stationery</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Stationery</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Products"}>
                          Products
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-notepad"></i>
                      <span className="link_name">Time Table</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">TimeTable</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Period Slot"}>
                          Period Slot
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Class Time Table"}>
                          Class Time Table
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/timetable"} state={"Class Time Table"}>
                        Period Time Table
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-bus"></i>
                      <span className="link_name">Transport</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Transport</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/master"} state={"Transport"}>
                          Transport Services
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
              </>
            ) : (
              <>
                <span class="horizontal-line"></span>

                <li>
                  <a style={{ height: "50px" }}>
                    <Link to={"/staffview"} state={"Staff View Attendance"}>
                      <i class="fa-regular fa-calendar-check"></i>
                      <span className="link_name">Attendance</span>
                    </Link>
                  </a>
                  <ul className="sub-menu blank">
                    <Link to={"/staffview"}>
                      <li>
                        <a style={{ height: "10px", padding: "20px" }}>
                          Attendance
                        </a>
                      </li>
                    </Link>
                  </ul>
                </li>
                <span class="horizontal-line"></span>

                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i className="fas fa-graduation-cap fa-fw unchecked-icon"></i>
                      <span className="link_name">Student</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Student</a>
                    </li>
                    <li>
                      <a>
                        <i className="bx bxs-pencil"></i>
                        <Link to={"/studentattendence"} state={"Attendance"}>
                          Student Attendance
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i className="bx bxs-pencil"></i>
                        <Link to={"/viewattendance"} state={"View Attendance"}>
                          View Attendance
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i className="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Assignment"}>
                          Assignment
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i className="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Homework"}>
                          Home Work
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>

                <span class="horizontal-line"></span>

                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="fa fa-edit"></i>
                      <span className="link_name">Exam</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Exam</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Exam Type"}>
                          Exam Type
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Exam Portion"}>
                          Exam Portion
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/exam"} state={"Subject Mark"}>
                          Subject Mark
                        </Link>
                      </a>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Exam Report List"}>
                          Exam Report List
                        </Link>
                      </a>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/examresult"} state={"Exam Result"}>
                          Exam Result
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bx-calendar-star"></i>
                      <span className="link_name">Grade</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Grade</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Overall grade"}>
                          Overall Grade
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Subject grade"}>
                          Subject Grade
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="bx bxs-id-card"></i>
                      <span className="link_name">Stationery</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Stationery</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link
                          to={"/Studendstationery"}
                          state={"Studend Stationery"}
                        >
                          Products
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>

                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      <i class="fa-sharp fa-solid fa-calendar-days"></i>
                      <span className="link_name">Events</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Events</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/staff"} state={"Events"}>
                          Events
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
                <li>
                  <div
                    className="iocn-link"
                    style={{ cursor: "pointer" }}
                    onClick={toggleSubMenu}
                  >
                    <a>
                      {/* <i class="bx bxs-bus"></i> */}
                      <i class="bx bxs-report"></i>
                      <span className="link_name">Report</span>
                    </a>
                    <i className="bx bxs-chevron-down arrow"></i>
                  </div>
                  <ul className="sub-menu">
                    <li>
                      <a className="link_name">Report</a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/assignment"} state={"Assignment Report"}>
                          Assignment Report
                        </Link>
                      </a>
                    </li>
                    <li>
                      <a>
                        <i class="bx bxs-pencil"></i>
                        <Link to={"/examtable"} state={"Exam Results"}>
                          Exam Report
                        </Link>
                      </a>
                    </li>
                  </ul>
                </li>
                <span class="horizontal-line"></span>
              </>
            )}
          </>

          {/* <li>
                        <div className="profile-details">
                            <div className="profile-content">
                                <img src={image} alt="profileImg" />
                            </div>
                            <div className="name-job">
                                <div className="profile_name">{role}</div>
                            </div>
                            <i className='bx bx-log-out' onClick={logout}></i>
                        </div>
                    </li> */}
        </ul>
      </div>
      <section className="home-section">
        <div className="home-route">
          <div className="home-content ">
            <i className="bx bx-menu" onClick={toggleSidebar}></i>
            <div className="profile-content">
              <img
                src={image}
                alt="profileImg"
                onClick={openLogout}
                style={{ cursor: "pointer" }}
              />
              <div>
                <span onClick={openLogout} style={{ cursor: "pointer",fontSize:'12px',fontWeight:'300',fontFamily:"sans-serif" }}>
                  {" "}
                  {userName}
                </span>
                <p
                  className="profile_name"
                  onClick={openLogout}
                  style={{ cursor: "pointer",fontWeight:'500',fontSize:'10px',fontFamily:"sans-serif"  }}
                >
                  {role}
                </p>
                {isModalOpen && (
                  <div className="modal-overlay">
                    <div className=" modal-content-popup">
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          marginRight: "-1px",
                          marginTop: "53px",
                        }}
                        className="modal-close "
                        onClick={closeLogout}
                      >
                        <i
                          class="bx bxs-x-circle"
                          style={{ fontSize: "20px", color: "gray" }}
                        ></i>
                      </span>
                      <h4
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "10px",
                          marginTop: "7px",
                          color: "#051F3E",
                          fontSize:'12px',
                          fontWeight:'300',
                          padding:'3px'
                        }}
                      >
                        Profile
                      </h4>
                      <p
                        style={{
                          width: "180px",
                          borderBottom: "1px solid rgb(205,207,216)",
                          marginTop: "-5px",
                          marginBottom: "15px",
                          fontSize:'12px'
                        }}
                      >
                        {" "}
                      </p>
                      {/* <i className="bx bx-log-out"></i> */}
                      <div
                        style={{ display: "grid", justifyContent: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        >
                          {" "}
                          <img src={image} alt="profileImg" />
                        </div>

                        <span
                          style={{
                            marginRight: "0px",
                            display: "flex",
                            justifyContent: "center",
                            fontSize:'12px',
                            fontWeight:"300",
                            fontFamily:"sans-serif"
                          }}
                        >
                          {" "}
                          {userName}
                        </span>
                        <p
                          className="profile_name"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginRight: "0px",
                            fontWeight:'500',fontSize:'10px',fontFamily:"sans-serif"
                          }}
                        >
                          {role}
                        </p>
                      </div>

                      <div className="profile-two-button"
                        style={{
                          display: "flex",
                          marginTop: "10px",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                         <button 
                          style={{
                            backgroundColor: "#052955",
                            color: "white",
                            borderRadius: "8px",
                            padding: "6px",
                            height: "30px",
                            fontSize: "13px",
                            fontFamily:"sans-serif",
                            fontWeight:"300"
                          }}
                          onClick={logout}
                        >
                          Logout
                        </button>
                        <button
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            borderRadius: "8px",
                            padding: "6px",
                            height: "30px",
                            fontSize: "13px",
                            fontFamily:"sans-serif",
                            fontWeight:"300"
                          }}
                          onClick={closeLogout}
                        >
                          Cancel
                        </button>
                       
                      </div>
                    </div>
                  </div>
                )}
                {/* {logouts ? (
                  <div className="dropdown-content" onClick={logout}>
                    {" "}
                    <i className="bx bx-log-out"></i>Logout
                  </div>
                ) : (
                  ""
                )} */}
              </div>
              <i
                className="bx bxs-chevron-down arrow"
                onClick={openLogout}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
          </div>
          <div className="change-routes">
            <Routes>
              <Route exact path="/" element={<Dashboard />} />

              <>
                {role === "Admin" ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/master" element={<Master />} />
                    <Route path="/nationality" element={<Nationality />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/releiving" element={<Registration />} />
                    <Route path="/list" element={<List />} />
                    <Route path="/timetable" element={<Timetable />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/staffattendance" element={<Staffattendance />} />
                    <Route path="/stafflist/:id" element={<Stafflist />} />
                    <Route path="/studentlist/:id" element={<Studendlist />} />
                    <Route path="/studentinfo/:id" element={<Studentinfo />} />
                    <Route path="/nextpage" element={<Nextpage />} />
                  </>
                ) : (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/attendence" element={<Attendence />} />
                    <Route path="/studentattendence" element={<Attendence />} />
                    
                    {/* <Route path="/staff" element={<Assignment/>} /> */}
                    <Route path="/homework" element={<Homework />} />
                    <Route path="/events" element={<Event />} />
                    <Route path="/products" element={<Product />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/exam" element={<Exam />} />
                    <Route path="/examtable" element={<ExamTable />} />
                    <Route path="/examresult" element={<Examresult />} />
                    <Route path="/assignment" element={<Assignment />} />
                    <Route
                      path="/viewattendance"
                      element={<ViewAttendance />}
                    />
                    <Route
                      path="/studendstationery"
                      element={<Studendstationery />}
                    />
                    <Route path="/staffview" element={<Staffview />} />
                  </>
                )}
              </>
            </Routes>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Nav;
