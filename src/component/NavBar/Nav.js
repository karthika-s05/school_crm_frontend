import React, { useState, useEffect, useRef } from "react";
import "./nav.css";
import Dashboard from "../../pages/dashboard";
import Master from "../../pages/master";
import Registration from "../../pages/registration/registration";
import { Routes, Route, Link, useLocation } from "react-router-dom";
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
import Staffattendance from "../Atttendence/Staffattendance.js";
import Staffview from "../Atttendence/Staffview.js";
import Nationality from "../../pages/master/nationality/Nationality.js";
import Studendlist from "../../pages/List/Studendlist.js";
import Stafflist from "../../pages/List/Stafflist.js";
import Studentinfo from "../../pages/List/Studentinfo.js";
import Nextpage from "../../pages/List/Nextpage.js";
import StudentDummyList from "../../pages/List/StudentDummyList.js";
import logo from '../../assets/images/kst_logo.png'
import { IoIosArrowForward } from "react-icons/io";


/*  Sub link  active when path + state both match  */
const SubLink = ({ to, state, children }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to && location.state === state;
  return (
    <Link
      to={to}
      state={state}
      className={`kst-sub-link${isActive ? " kst-sub-active" : ""}`}
    >
      <i></i>
      {children}
    </Link>
  );
};

/*  NavItem  auto-opens when any child sub-link is active  */
const NavItem = ({ icon, label, children, collapsed, childPaths = [], activeItem, setActiveItem }) => {
  const location = useLocation();
  const itemRef = useRef(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const isChildActive = childPaths.some(
    (cp) => location.pathname === cp.to && location.state === cp.state
  );

  // open = expanded (non-collapsed) OR flyout visible (collapsed)
  const open = activeItem === label || (!collapsed && isChildActive);

  useEffect(() => {
    // auto-open the correct item when navigating directly
    if (isChildActive && !collapsed) setActiveItem(label);
  }, [isChildActive, collapsed]);

  // close flyout on route change
  useEffect(() => {
    if (collapsed) setActiveItem(null);
  }, [location.pathname, location.state]);

  const handleClick = () => {
    if (collapsed && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setFlyoutTop(rect.top);
    }
    setActiveItem(activeItem === label ? null : label);
  };

  return (
    <div className={`kst-nav-item${open ? " open" : ""}`} ref={itemRef}>
      <div
        className={`kst-nav-link${isChildActive ? " active" : ""}`}
        onClick={handleClick}
      >
        <i className={`${icon} nav-icon`}></i>
        <span className="nav-label">{label}</span>
        <i className="bx bxs-chevron-down nav-arrow"></i>
      </div>

      {!collapsed && (
        <div className="kst-submenu">{children}</div>
      )}

      {collapsed && open && (
        <div className="kst-flyout" style={{ top: flyoutTop }}>
          <div className="kst-flyout-title">{label}</div>
          {children}
        </div>
      )}
    </div>
  );
};

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const image = getUserData("image");
  const userName = getUserData("adminName") || getUserData("staffName");
  const role = getUserData("role");
  const [collapsed, setCollapsed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.state]);

  const logout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
  };

  const isActive = (...paths) => paths.includes(location.pathname);

  // const pageTitle = () => {
  //   const map = {
  //     "/dashboard": "Dashboard",
  //     "/master": location.state ? String(location.state) : "Master",
  //     "/students": "Student List",
  //     "/list": "List",
  //     "/timetable": "Time Table",
  //     "/staff": "Staff Panel",
  //     "/exam": "Exam",
  //     "/staffview": "Attendance",
  //     "/studentattendence": "Student Attendance",
  //     "/viewattendance": "View Attendance",
  //   };
  //   return map[location.pathname] || "Dashboard";
  // };

  // Child path definitions for NavItems (used for active detection)
  const masterPaths = [
    { to: "/master", state: "Nationality" },
    { to: "/master", state: "State" },
    { to: "/master", state: "City" },
    { to: "/master", state: "BloodGroup" },
    { to: "/master", state: "Community" },
    { to: "/master", state: "Religion" },
    { to: "/master", state: "Subject" },
    { to: "/master", state: "Class" },
    { to: "/master", state: "Section" },
  ];

  const studentAdminPaths = [
    { to: "/students", state: "Student List" },
    { to: "/studentlist/:id", state: "Student Registration" },
  ];

  const staffAdminPaths = [
    { to: "/list", state: "Staff List" },
    { to: "/stafflist/:id", state: "Staff Registration" },
  ];

  const mappingPaths = [
    { to: "/master", state: "Class & Section" },
    { to: "/master", state: "Class Teacher" },
    { to: "/master", state: "Subject Teacher" },
  ];

  const timetablePaths = [
    { to: "/master", state: "Period Slot" },
    { to: "/master", state: "Class Time Table" },
    { to: "/timetable", state: "Class Time Table" },
  ];

  const stationeryAdminPaths = [{ to: "/master", state: "Products" }];
  const transportPaths = [{ to: "/master", state: "Transport" }];

  const studentStaffPaths = [
    { to: "/studentattendence", state: "Attendance" },
    { to: "/viewattendance", state: "View Attendance" },
    { to: "/staff", state: "Assignment" },
    { to: "/staff", state: "Homework" },
  ];

  const examPaths = [
    { to: "/staff", state: "Exam Type" },
    { to: "/staff", state: "Exam Portion" },
    { to: "/exam", state: "Subject Mark" },
    { to: "/examresult", state: "Exam Result" },
  ];

  const gradePaths = [
    { to: "/staff", state: "Overall grade" },
    { to: "/staff", state: "Subject grade" },
  ];

  const stationeryStaffPaths = [{ to: "/Studendstationery", state: "Studend Stationery" }];
  const eventsPaths = [{ to: "/staff", state: "Events" }];
  const reportPaths = [
    { to: "/assignment", state: "Assignment Report" },
    { to: "/examtable", state: "Exam Results" },
  ];

  return (
    <div className="kst-shell">
      {/* Mobile overlay */}
      <div
        className={`kst-overlay${mobileOpen ? " visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`kst-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>

        {/* Mobile close */}
        <button className="kst-mobile-close" onClick={() => setMobileOpen(false)}>
          <i className="bx bx-x"></i>
        </button>

        <div className="kst-logo">
          <img src={logo} alt="logo" className="kst-logo-img" />
        </div>

        <nav className="kst-nav">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`kst-nav-link${isActive("/dashboard", "/") ? " active" : ""}`}
          >
            <i className="bx bx-grid-alt nav-icon"></i>
            <span className="nav-label">Dashboard</span>
          </Link>

          {role === "Admin" ? (
            <>
              <div className="kst-nav-section">Management</div>

              <NavItem icon="bx bxs-group" label="Master" collapsed={collapsed} childPaths={masterPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/master" state="Nationality">Nationality</SubLink>
                <SubLink to="/master" state="State">State</SubLink>
                <SubLink to="/master" state="City">City</SubLink>
                <SubLink to="/master" state="BloodGroup">Blood Group</SubLink>
                <SubLink to="/master" state="Community">Community</SubLink>
                <SubLink to="/master" state="Religion">Religion</SubLink>
                <SubLink to="/master" state="Subject">Subject</SubLink>
                <SubLink to="/master" state="Class">Class</SubLink>
                <SubLink to="/master" state="Section">Section</SubLink>
              </NavItem>

              <NavItem icon="bx bxs-user-check" label="Student" collapsed={collapsed} childPaths={studentAdminPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/students" state="Student List">List</SubLink>
                <SubLink to="/studentlist/:id" state="Student Registration">Registration</SubLink>
              </NavItem>

              <NavItem icon="bx bxs-user-x" label="Staff" collapsed={collapsed} childPaths={staffAdminPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/list" state="Staff List">List</SubLink>
                <SubLink to="/stafflist/:id" state="Staff Registration">Registration</SubLink>
              </NavItem>

              <div className="kst-nav-section">Academic</div>

              <NavItem icon="bx bx-group" label="Mapping" collapsed={collapsed} childPaths={mappingPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/master" state="Class & Section">Class & Section</SubLink>
                <SubLink to="/master" state="Class Teacher">Class Teacher</SubLink>
                <SubLink to="/master" state="Subject Teacher">Subject Teacher</SubLink>
              </NavItem>

              <NavItem icon="bx bxs-notepad" label="Time Table" collapsed={collapsed} childPaths={timetablePaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/master" state="Period Slot">Period Slot</SubLink>
                <SubLink to="/master" state="Class Time Table">Class Time Table</SubLink>
                <SubLink to="/timetable" state="Class Time Table">Period Time Table</SubLink>
              </NavItem>

              <div className="kst-nav-section">Other</div>

              <NavItem icon="bx bxs-id-card" label="Stationery" collapsed={collapsed} childPaths={stationeryAdminPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/master" state="Products">Products</SubLink>
              </NavItem>

              <NavItem icon="bx bxs-bus" label="Transport" collapsed={collapsed} childPaths={transportPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/master" state="Transport">Transport Services</SubLink>
              </NavItem>
            </>
          ) : (
            <>
              <div className="kst-nav-section">My Work</div>

              <Link
                to="/staffview"
                className={`kst-nav-link${isActive("/staffview") ? " active" : ""}`}
              >
                <i className="bx bxs-calendar-check nav-icon"></i>
                <span className="nav-label">Attendance</span>
              </Link>

              <NavItem icon="bx bxs-graduation" label="Student" collapsed={collapsed} childPaths={studentStaffPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/studentattendence" state="Attendance">Student Attendance</SubLink>
                <SubLink to="/viewattendance" state="View Attendance">View Attendance</SubLink>
                <SubLink to="/staff" state="Assignment">Assignment</SubLink>
                <SubLink to="/staff" state="Homework">Home Work</SubLink>
              </NavItem>

              <NavItem icon="bx bx-edit" label="Exam" collapsed={collapsed} childPaths={examPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/staff" state="Exam Type">Exam Type</SubLink>
                <SubLink to="/staff" state="Exam Portion">Exam Portion</SubLink>
                <SubLink to="/exam" state="Subject Mark">Subject Mark</SubLink>
                <SubLink to="/examresult" state="Exam Result">Exam Result</SubLink>
              </NavItem>

              <NavItem icon="bx bx-calendar-star" label="Grade" collapsed={collapsed} childPaths={gradePaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/staff" state="Overall grade">Overall Grade</SubLink>
                <SubLink to="/staff" state="Subject grade">Subject Grade</SubLink>
              </NavItem>

              <div className="kst-nav-section">More</div>

              <NavItem icon="bx bxs-id-card" label="Stationery" collapsed={collapsed} childPaths={stationeryStaffPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/Studendstationery" state="Studend Stationery">Products</SubLink>
              </NavItem>

              <NavItem icon="bx bx-calendar-event" label="Events" collapsed={collapsed} childPaths={eventsPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/staff" state="Events">Events</SubLink>
              </NavItem>

              <NavItem icon="bx bxs-report" label="Report" collapsed={collapsed} childPaths={reportPaths} activeItem={activeItem} setActiveItem={setActiveItem}>
                <SubLink to="/assignment" state="Assignment Report">Assignment Report</SubLink>
                <SubLink to="/examtable" state="Exam Results">Exam Report</SubLink>
              </NavItem>
            </>
          )}
        </nav>

        <div className="kst-sidebar-user" onClick={() => setShowPopup(!showPopup)}>
          <img src="https://img.magnific.com/free-vector/woman-with-long-brown-hair-pink-shirt_90220-2940.jpg?semt=ais_hybrid&w=740&q=80" alt="user" />
          <div className="kst-sidebar-user-info">
            <strong>{userName}</strong>
            <span>{role}</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className="kst-main">
        
       
        <header className="kst-topbar">

          {/* Collapse toggle — far left of header */}
          <button
            className={`kst-toggle-btn${collapsed ? " collapsed" : ""}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <IoIosArrowForward />
          </button>

          <span className="page-title">
            {location.pathname === "/master" && location.state
              ? String(location.state)
              : location.pathname === "/students" ? "Student List"
              : location.pathname === "/staffview" ? "Attendance"
              : location.pathname === "/studentattendence" ? "Student Attendance"
              : location.pathname === "/viewattendance" ? "View Attendance"
              : location.pathname === "/timetable" ? "Time Table"
              : location.pathname === "/exam" ? "Exam"
              : location.pathname === "/examresult" ? "Exam Result"
              : location.pathname === "/assignment" ? "Assignment Report"
              : location.pathname === "/examtable" ? "Exam Report"
              : location.pathname === "/list" ? "Staff List"
              : "Dashboard"}
          </span>

          <div className="topbar-right">
            <div className="search-box">
            <i className="bx bx-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
            {/* <div className="tb-icon-btn">
              <i className="bx bx-bell"></i>
              <span className="notif-dot"></span>
            </div> */}
            <div className="tb-icon-btn">
              <i className="bx bx-bell"></i>
            </div>
            <div className="tb-user-wrap" onClick={() => setShowPopup(!showPopup)}>
              <img src="https://img.magnific.com/free-vector/woman-with-long-brown-hair-pink-shirt_90220-2940.jpg?semt=ais_hybrid&w=740&q=80" alt="user" />
              <div className="tb-user-info">
                <strong>{userName}</strong>
                <span>{role}</span>
              </div>
              <i className="bx bxs-chevron-down" style={{ fontSize: 13, color: "#7b8099" }}></i>

              {showPopup && (
                <div className="kst-user-popup" onClick={e => e.stopPropagation()}>
                  <div className="pop-avatar">
                    <img src="https://img.magnific.com/free-vector/woman-with-long-brown-hair-pink-shirt_90220-2940.jpg?semt=ais_hybrid&w=740&q=80" alt="user" />
                    <div>
                      <div className="pop-name">{userName}</div>
                      <div className="pop-role">{role}</div>
                    </div>
                  </div>
                  <hr />
                  <button className="pop-btn logout" onClick={logout}>
                    <i className="bx bx-log-out"></i> Logout
                  </button>
                  <button className="pop-btn cancel" onClick={() => setShowPopup(false)}>
                    Cancel
                  </button>
                </div>
              )}
              
            </div>
            
          </div>
        </header>

        <div className="kst-page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {role === "Admin" ? (
              <>
                <Route path="/master" element={<Master />} />
                <Route path="/nationality" element={<Nationality />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/releiving/:id" element={<Registration />} />
                <Route path="/students" element={<StudentDummyList />} />
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
                <Route path="/attendence" element={<Attendence />} />
                <Route path="/studentattendence" element={<Attendence />} />
                <Route path="/homework" element={<Homework />} />
                <Route path="/events" element={<Event />} />
                <Route path="/products" element={<Product />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/report" element={<Report />} />
                <Route path="/exam" element={<Exam />} />
                <Route path="/examtable" element={<ExamTable />} />
                <Route path="/examresult" element={<Examresult />} />
                <Route path="/assignment" element={<Assignment />} />
                <Route path="/viewattendance" element={<ViewAttendance />} />
                <Route path="/studendstationery" element={<Studendstationery />} />
                <Route path="/staffview" element={<Staffview />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Nav;
