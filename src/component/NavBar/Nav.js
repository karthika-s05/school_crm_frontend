import React, { useState, useRef, useEffect } from "react";
import "./nav.css";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import {
  FiBell, FiSearch,
  FiChevronLeft, FiChevronRight, FiX, FiCheck, FiTrash2,
} from "react-icons/fi";

import { getUserData, removeToken, getToken } from "../../services/auth";
import { getNotifications, updateNotificationTime } from "../../services/api";

import Dashboard from "../../pages/dashboard";
import Master from "../../pages/master";
import Registration from "../../pages/registration/registration";
import List from "../../pages/List/list";
import Profile from "../../pages/profile/profile";
import Timetable from "../../pages/Timetable/timetable";
import Attendence from "../Atttendence/Attendence";
import Assignment from "../Assignment/Assignment";
import Homework from "../Homework/Homework";
import Event from "../../pages/Event/Event";
import Product from "../../pages/Product/Product";
import Staff from "../../pages/staff";
import Exam from "../../pages/exam/exam";
import Examresult from "../../pages/exam/examResults";
import ExamType from "../../pages/exam/ExamType";
import ExamPortion from "../../pages/exam/ExamPortion";
import ExamReport from "../../pages/report/ExamReport";
import AssignmentReport from "../../pages/report/AssignmentReport";
import ReportsOverview from "../../pages/report/ReportsOverview";
import AttendanceReport from "../../pages/report/AttendanceReport";
import HomeworkReport from "../../pages/report/HomeworkReport";
import LeaveManagement from "../../pages/services/LeaveManagement";
import ViewAttendance from "../Atttendence/ViewAttendance";
import Studendstationery from "../stationery/Studendstationery";
import Staffattendance from "../Atttendence/Staffattendance";
import Staffview from "../Atttendence/Staffview";
import Nationality from "../../pages/master/nationality/Nationality";
import Studendlist from "../../pages/List/Studendlist";
import StudentWizard from "../../pages/registration/StudentWizard";
import StaffWizard from "../../pages/registration/StaffWizard";
import Studentinfo from "../../pages/List/Studentinfo";
import Nextpage from "../../pages/List/Nextpage";
import StudentDummyList from "../../pages/List/StudentDummyList";
import Transport from "../../pages/services/Transport";
import Stationery from "../../pages/services/Stationery";
import StudentPortal from "../../pages/student/StudentPortal";
import "../../assets/illustrations/schoolTheme.css";
import { SchoolAmbience, SchoolBellIcon } from "../../assets/illustrations/SchoolIllustrations";
import { SchoolMenuIcon, SchoolSubMenuIcon, IconChevronDown, IconSidebarCollapse, IconSidebarExpand, IconLogout, IconSettings, HeaderStationeryDeco } from "../../assets/illustrations/SchoolMenuIcons";

const ADMIN_MENU_GROUPS = [
  {
    title: "Student", icon: null, section: "Management",
    items: [
      { label: "Student List",   path: "/admin/students",      state: "Student List" },
      { label: "Registration",   path: "/admin/student/new",   state: "Student Registration" },
    ],
  },
  {
    title: "Staff", icon: null,
    items: [
      { label: "Staff List",     path: "/admin/staff",         state: "Staff List" },
      { label: "Registration",   path: "/admin/staff/new",     state: "Staff Registration" },
    ],
  },
  {
    title: "Master", icon: null,
    items: [
      { label: "Nationality",    path: "/admin/master",        state: "Nationality" },
      { label: "State",          path: "/admin/master",        state: "State" },
      { label: "City",           path: "/admin/master",        state: "City" },
      { label: "Blood Group",    path: "/admin/master",        state: "BloodGroup" },
      { label: "Community",      path: "/admin/master",        state: "Community" },
      { label: "Religion",       path: "/admin/master",        state: "Religion" },
      { label: "Subject",        path: "/admin/master",        state: "Subject" },
      { label: "Class",          path: "/admin/master",        state: "Class" },
      { label: "Section",        path: "/admin/master",        state: "Section" },
    ],
  },
  {
    title: "Mapping", icon: null, section: "Academics",
    items: [
      { label: "Class & Section",  path: "/admin/class&section",      state: "Class & Section" },
      { label: "Class Teacher",    path: "/admin/classTeacher",      state: "Class Teacher" },
      { label: "Subject Teacher",  path: "/admin/subjectTeacher",      state: "Subject Teacher" },
    ],
  },
  {
    title: "Time Table", icon: null,
    items: [
      { label: "Period Slot",       path: "/admin/periodSlot",     state: "Period Slot" },
      { label: "Class Time Table",  path: "/admin/classTimetable",     state: "Class Time Table" },
      { label: "Period Time Table", path: "/admin/periodTimetable",  state: undefined },
    ],
  },
  {
    title: "Examination", icon: null,
    items: [
      { label: "Exam Type",    path: "/admin/examtype",    state: undefined },
      { label: "Exam Portion", path: "/admin/examportion", state: undefined },
      { label: "Subject Mark", path: "/admin/subjectmark", state: undefined },
      { label: "Exam Result",  path: "/admin/examresult",  state: undefined },
    ],
  },
  {
    title: "Stationery", icon: null, section: "Services",
    items: [
      { label: "Stationery", path: "/admin/stationery", state: undefined },
    ],
  },
  {
    title: "Transport", icon: null,
    items: [
      { label: "Transport", path: "/admin/transport", state: undefined },
    ],
  },
  {
    title: "Leave", icon: null, section: "Operations",
    items: [
      { label: "Leave Management", path: "/admin/leave", state: undefined },
    ],
  },
  {
    title: "Reports", icon: null, section: "Reports",
    items: [
      { label: "Reports Overview",   path: "/admin/reports",            state: undefined },
      { label: "Assignment Report",  path: "/admin/reports/assignment", state: undefined },
      { label: "Exam Report",        path: "/admin/reports/exam",       state: undefined },
      { label: "Attendance Report",  path: "/admin/reports/attendance", state: undefined },
      { label: "Homework Report",    path: "/admin/reports/homework",   state: undefined },
    ],
  },
];

const STAFF_MENU_GROUPS = [
  {
    title: "Attendance", icon: null, section: "Classroom",
    items: [
      { label: "Student Attendance", path: "/staffattendance", state: undefined },
      { label: "View Attendance", path: "/viewattendance", state: undefined },
      { label: "My Attendance", path: "/myattendance", state: undefined },
    ],
  },
  {
    title: "Assignment", icon: null,
    items: [
      { label: "Assignment", path: "/staff/assignment", state: "Assignment" },
    ],
  },
  {
    title: "Homework", icon: null,
    items: [
      { label: "Homework", path: "/staff/homework", state: "Homework" },
    ],
  },
  {
    title: "Examination", icon: null, section: "Academics",
    items: [
      { label: "Exam Type", path: "/examtype", state: "Exam Type" },
      { label: "Exam Portion", path: "/examportion", state: "Exam Portion" },
      { label: "Subject Mark", path: "/subjectmark", state: "Subject Mark" },
      { label: "Exam Result", path: "/examresult", state: "Exam Result" },
    ],
  },
  {
    title: "Time Table", icon: null,
    items: [
      { label: "Class Timetable", path: "/timetable", state: undefined },
    ],
  },
  {
    title: "Events", icon: null, section: "Activities",
    items: [
      { label: "Events", path: "/staff/events", state: "Events" },
    ],
  },
  {
    title: "Leave", icon: null, section: "Operations",
    items: [
      { label: "Leave Management", path: "/leave", state: undefined },
    ],
  },
  {
    title: "Reports", icon: null, section: "Reports",
    items: [
      { label: "Reports Overview", path: "/reports", state: undefined },
      { label: "Assignment Report", path: "/assignment", state: "Assignment Report" },
      { label: "Attendance Report", path: "/reports/attendance", state: undefined },
      { label: "Homework Report", path: "/reports/homework", state: undefined },
    ],
  },
];

const STUDENT_MENU_GROUPS = [
  {
    title: "My Portal", icon: null, section: "My School",
    items: [
      { label: "Attendance",   path: "/student/portal", state: "Attendance"   },
      { label: "Marks",        path: "/student/portal", state: "Marks"        },
      { label: "Homework",     path: "/student/portal", state: "Homework"     },
      { label: "Assignments",  path: "/student/portal", state: "Assignments"  },
      { label: "Exams",        path: "/student/portal", state: "Exams"        },
      { label: "Timetable",    path: "/student/portal", state: "Timetable"    },
      { label: "Events",       path: "/student/portal", state: "Events"       },
    ],
  },
  {
    title: "My Teachers", icon: null,
    items: [
      { label: "Class Teacher",   path: "/student/portal", state: "ClassTeacher"   },
      { label: "Subject Teachers", path: "/student/portal", state: "SubjectTeachers" },
    ],
  },
  {
    title: "Leave", icon: null, section: "Services",
    items: [
      { label: "My Leave", path: "/student/portal", state: "Leave" },
    ],
  },
];

const getMenuGroups = (role) => {
  if (role === "Staff") return STAFF_MENU_GROUPS;
  if (role === "Student") return STUDENT_MENU_GROUPS;
  return ADMIN_MENU_GROUPS;
};

// Keep MENU_GROUPS as alias for resolvePageTitle (uses all groups)
const MENU_GROUPS = [...ADMIN_MENU_GROUPS, ...STAFF_MENU_GROUPS, ...STUDENT_MENU_GROUPS];

// Resolve active page title + parent from pathname + state
const resolvePageTitle = (pathname, state) => {
  if (pathname === "/dashboard" || pathname === "/") return { title: "Dashboard", parent: "Home" };
  for (const group of MENU_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname && (!item.state || item.state === state)) {
        return { title: item.label, parent: group.title };
      }
    }
  }
  if (pathname === "/admin/students")           return { title: "Student List",      parent: "Student"    };
  if (pathname === "/admin/staff")              return { title: "Staff List",        parent: "Staff"      };
  if (pathname === "/admin/reports/exam")       return { title: "Exam Report",       parent: "Reports"    };
  if (pathname === "/admin/reports/assignment") return { title: "Assignment Report", parent: "Reports"    };
  if (pathname === "/admin/reports")            return { title: "Reports Overview",  parent: "Reports"    };
  if (pathname === "/admin/reports/attendance") return { title: "Attendance Report", parent: "Reports"    };
  if (pathname === "/admin/reports/homework")   return { title: "Homework Report",   parent: "Reports"    };
  if (pathname === "/admin/leave")              return { title: "Leave Management",  parent: "Operations" };
  if (pathname === "/admin/view-attendance")    return { title: "View Attendance",   parent: "Attendance" };
  if (pathname === "/admin/my-attendance")      return { title: "My Attendance",     parent: "Attendance" };
  if (pathname === "/admin/attendance")         return { title: "Student Attendance",parent: "Attendance" };
  if (pathname.startsWith("/releiving"))        return { title: "Relieving",         parent: "Staff"      };
  if (pathname.startsWith("/admin/studentinfo"))return { title: "Document Upload",   parent: "Student"    };
  if (pathname.startsWith("/admin/student"))    return { title: "Registration",      parent: "Student"    };
  if (pathname.startsWith("/admin/staff/"))     return { title: "Registration",      parent: "Staff"      };
  if (pathname.startsWith("/admin/transport"))  return { title: "Transport",         parent: "Services"   };
  if (pathname.startsWith("/admin/stationery")) return { title: "Stationery",        parent: "Services"   };
  if (pathname === "/admin/settings")           return { title: "Settings",          parent: "Home"       };
  return { title: "Dashboard", parent: "Home" };
};

const MenuGroup = ({ title, items, openMenu, setOpenMenu, collapsed, pathname, locationState, onFlyoutNavigate }) => {
  const btnRef = useRef(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const isOpen = openMenu === title;

  const hasActiveChild = items.some(item =>
    item.path === pathname && (!item.state || item.state === locationState)
  );

  const handleToggle = () => {
    if (collapsed) {
      if (!isOpen && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setFlyoutTop(rect.top);
      }
      setOpenMenu(isOpen ? null : title);
    } else {
      setOpenMenu(isOpen ? null : title);
    }
  };

  const subLinks = items.map((item, i) => {
    const isSubActive =
      item.path === pathname &&
      (!item.state || item.state === locationState);
    return (
      <Link
        key={i}
        to={item.path}
        state={item.state}
        className={`crm-sub-link${isSubActive ? " sub-active" : ""}`}
        onClick={() => onFlyoutNavigate?.()}
      >
        <span className="crm-sub-icon"><SchoolSubMenuIcon label={item.label} /></span>
        {item.label}
      </Link>
    );
  });

  return (
    <div className={`crm-menu-group${isOpen && collapsed ? " flyout-open" : ""}`}>
      <button
        ref={btnRef}
        className={`crm-menu-btn${hasActiveChild ? " active" : ""}${isOpen && !collapsed ? " open" : ""}`}
        onClick={handleToggle}
        title={collapsed ? title : undefined}
        aria-expanded={isOpen}
      >
        <div className="crm-menu-left">
          <span className="crm-menu-icon"><SchoolMenuIcon name={title} /></span>
          {!collapsed && <span className="crm-menu-label">{title}</span>}
        </div>
        {!collapsed && (
          <IconChevronDown className={`crm-arrow${isOpen ? " rotate" : ""}`} />
        )}
        {hasActiveChild && collapsed && <span className="crm-active-dot" />}
      </button>

      {/* Expanded sidebar - inline submenu */}
      {!collapsed && isOpen && (
        <div className="crm-submenu">{subLinks}</div>
      )}

      {/* Collapsed sidebar - flyout popup */}
      {collapsed && isOpen && (
        <div
          className="crm-submenu-flyout"
          style={{ top: flyoutTop }}
        >
          <div className="crm-flyout-header">
            <SchoolMenuIcon name={title} />
            <span>{title}</span>
          </div>
          <div className="crm-flyout-items">{subLinks}</div>
        </div>
      )}
    </div>
  );
};

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const locState = location.state;

  // Derive active page title dynamically
  const { title: pageTitle, parent: pageParent } = resolvePageTitle(pathname, locState);

  const role = getUserData("role");
  const userName =
    role === "Student"
      ? getUserData("studentName")
      : role === "Staff"
      ? getUserData("staffName")
      : getUserData("adminName");
  const MENU_GROUPS_FOR_ROLE = getMenuGroups(role);

  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [showCal, setShowCal] = useState(false);
  const [calDate, setCalDate] = useState(new Date());
  const calRef = useRef(null);
  const today = new Date();

  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getNotifications(token)
      .then((res) => {
        if (res?.status === "success" && Array.isArray(res.data)) {
          setNotifications(
            res.data.map((n, i) => ({
              id: n.id || i,
              title: n.title || "Notification",
              desc: n.message || n.description || "",
              time: n.createdAt || n.time || "",
              read: n.isRead === 1 || n.read === true,
              icon: "bx bxs-bell",
              color: "#2D3A8C",
              bg: "#eef0fb",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (collapsed && openMenu) {
        const insideMenu = e.target.closest(".crm-menu-group") || e.target.closest(".crm-submenu-flyout");
        if (!insideMenu) setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed, openMenu]);

  useEffect(() => {
    if (collapsed) {
      setOpenMenu(null);
      return;
    }
    const match = MENU_GROUPS_FOR_ROLE.find(g =>
      g.items.some(item =>
        item.path === pathname && (!item.state || item.state === locState)
      )
    );
    if (match) setOpenMenu(match.title);
  }, [pathname, locState, collapsed, MENU_GROUPS_FOR_ROLE]);

  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonth = () => setCalDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalDate(new Date(calYear, calMonth + 1, 1));
  const isToday = (d) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const dateLabel = today.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    const token = getToken();
    if (token) updateNotificationTime(token).catch(() => {});
  };
  const clearAll = () => setNotifications([]);
  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  const logout = () => { removeToken(); navigate("/"); window.location.reload(); };

  const closeFlyout = () => { if (collapsed) setOpenMenu(null); };
  const isDashboardActive = pathname === "/dashboard" || pathname === "/";
  const isSettingsActive = pathname === "/admin/settings";

  const renderedSections = new Set();

  return (
    <div className="crm-layout">
      <SchoolAmbience />

      <aside className={`crm-sidebar${collapsed ? " collapsed" : ""}`}>

        <button
          className="crm-sidebar-toggle"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <IconSidebarExpand className="crm-toggle-icon" />
            : <IconSidebarCollapse className="crm-toggle-icon" />
          }
        </button>

        <div className="crm-logo">
          <div className="crm-logo-mark" aria-hidden="true">KST</div>
          {!collapsed && (
            <div>
              <h3>KST School</h3>
              <span>School CRM</span>
            </div>
          )}
        </div>

        <nav className="crm-nav">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`crm-link${isDashboardActive ? " active" : ""}`}
            title={collapsed ? "Dashboard" : undefined}
          >
            <span className="crm-menu-icon"><SchoolMenuIcon name="Dashboard" /></span>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {/* Dynamic menu groups */}
          {MENU_GROUPS_FOR_ROLE.map((group, i) => {
            const showSection = group.section && !renderedSections.has(group.section);
            if (showSection) renderedSections.add(group.section);
            return (
              <React.Fragment key={i}>
                {showSection && (
                  <div className="crm-section">
                    {!collapsed && group.section}
                  </div>
                )}
                <MenuGroup
                  title={group.title}
                  items={group.items}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  collapsed={collapsed}
                  pathname={pathname}
                  locationState={locState}
                  onFlyoutNavigate={closeFlyout}
                />
              </React.Fragment>
            );
          })}
        </nav>

        <div className="crm-sidebar-footer">
          <Link
            to="/admin/settings"
            className={`crm-link crm-settings-link${isSettingsActive ? " active" : ""}`}
            title={collapsed ? "Settings" : undefined}
          >
            <span className="crm-menu-icon"><IconSettings /></span>
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="crm-main">
        <header className="crm-header">
          <HeaderStationeryDeco />

          <div className="crm-header-left">
            <div className="crm-page-title-wrap">
              <h2 className="crm-page-title">{pageTitle}</h2>
              <span className="crm-page-breadcrumb">
                <span className="crm-breadcrumb-home">Home</span>
                {pageParent !== "Home" && (
                  <><span className="crm-breadcrumb-sep">›</span><span>{pageParent}</span></>
                )}
                {pageTitle !== pageParent && pageParent !== "Home" && (
                  <><span className="crm-breadcrumb-sep">›</span><span className="crm-breadcrumb-active">{pageTitle}</span></>
                )}
                {pageParent === "Home" && pageTitle !== "Dashboard" && (
                  <><span className="crm-breadcrumb-sep">›</span><span className="crm-breadcrumb-active">{pageTitle}</span></>
                )}
              </span>
            </div>
          </div>

          <div className="crm-header-right">
            {/* Search */}
            <div className="crm-search">
              <FiSearch />
              <input placeholder="Search students, staff, classes..." />
            </div>

            {/* Date card */}
            <div className="crm-date-wrap" ref={calRef}>
              <button className="crm-date-btn" onClick={() => setShowCal(v => !v)}>
                <i className="bx bx-calendar crm-date-icon"></i>
                <span className="crm-date-text">{dateLabel}</span>
              </button>

              {showCal && (
                <div className="crm-cal-popup">
                  <div className="crm-cal-header">
                    <button className="crm-cal-nav" onClick={prevMonth}><FiChevronLeft /></button>
                    <span className="crm-cal-title">{MONTHS[calMonth]} {calYear}</span>
                    <button className="crm-cal-nav" onClick={nextMonth}><FiChevronRight /></button>
                  </div>
                  <div className="crm-cal-days">
                    {DAYS.map(d => <span key={d} className="crm-cal-day-hdr">{d}</span>)}
                  </div>
                  <div className="crm-cal-grid">
                    {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <button
                        key={i}
                        className={`crm-cal-cell${isToday(i + 1) ? " today" : ""}`}
                        onClick={() => setShowCal(false)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="crm-cal-footer">
                    <button className="crm-cal-today-btn" onClick={() => { setCalDate(new Date()); setShowCal(false); }}>
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bell */}
            <button className="crm-notification" onClick={() => setShowNotif(v => !v)}>
              <FiBell />
              {unreadCount > 0 && (
                <span className="crm-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>

            <div className="crm-header-profile" ref={profileRef}>
              <button
                type="button"
                className={`crm-user crm-user-avatar-btn${showProfile ? " open" : ""}`}
                onClick={() => setShowProfile(v => !v)}
                aria-expanded={showProfile}
                aria-haspopup="true"
                aria-label="Open profile menu"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-dp4uGCohdJKwWhlWiiQvwaxGRTHaML-EA&s"
                  alt={userName || "Profile"}
                />
              </button>

              {showProfile && (
                <div className="crm-profile-menu">
                  <div className="crm-profile-menu-user">
                    <h4>{userName}</h4>
                    <p>{role}</p>
                  </div>
                  <button type="button" onClick={logout}><IconLogout /> Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Notification drawer */}
          {showNotif && (
            <div className="crm-notif-overlay" onClick={() => setShowNotif(false)}>
              <div className="crm-notif-drawer" ref={notifRef} onClick={e => e.stopPropagation()}>
                <div className="crm-nd-header">
                  <div className="crm-nd-title">
                    <i className="bx bxs-bell" style={{ color: "#2D3A8C", fontSize: 20 }}></i>
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="crm-nd-badge">{unreadCount} new</span>}
                  </div>
                  <button className="crm-nd-close" onClick={() => setShowNotif(false)}><FiX /></button>
                </div>

                <div className="crm-nd-actions">
                  <button className="crm-nd-act-btn" onClick={markAllRead}><FiCheck /> Mark all read</button>
                  <button className="crm-nd-act-btn crm-nd-act-danger" onClick={clearAll}><FiTrash2 /> Clear all</button>
                </div>

                <div className="crm-nd-list">
                  {notifications.length === 0 ? (
                    <div className="crm-nd-empty">
                      <i className="bx bx-bell-off"></i>
                      <p>No notifications</p>
                    </div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      className={`crm-nd-item${n.read ? "" : " unread"}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="crm-nd-item-icon" style={{ background: n.bg, color: n.color }}>
                        <i className={n.icon}></i>
                      </div>
                      <div className="crm-nd-item-body">
                        <div className="crm-nd-item-top">
                          <span className="crm-nd-item-title">{n.title}</span>
                          {!n.read && <span className="crm-nd-unread-dot"></span>}
                        </div>
                        <p className="crm-nd-item-desc">{n.desc}</p>
                        <span className="crm-nd-item-time">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {notifications.length > 0 && (
                  <div className="crm-nd-footer">
                    <button className="crm-nd-view-all">View all notifications <FiChevronRight /></button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="crm-page">
          <Routes>
            <Route path="/"                          element={<Dashboard />} />
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/admin/master"              element={<Master />} />
            <Route path="/admin/nationality"         element={<Nationality />} />
            <Route path="/admin/students"            element={<StudentDummyList />} />
            <Route path="/admin/staff"               element={<List />} />
            <Route path="/admin/student/new"         element={<StudentWizard />} />
            <Route path="/admin/student/:id"         element={<StudentWizard />} />
            <Route path="/admin/staff/new"           element={<StaffWizard />} />
            <Route path="/admin/staff/:id"           element={<StaffWizard />} />
            <Route path="/admin/studentinfo/:id"     element={<Studentinfo />} />
            <Route path="/admin/transport"           element={<Transport />} />
            <Route path="/admin/stationery"          element={<Stationery />} />
            <Route path="/admin/timetable"           element={<Timetable />} />
            <Route path="/admin/profile/:id"         element={<Profile />} />
            <Route path="/admin/attendance"          element={<Staffattendance />} />
            <Route path="/admin/view-attendance"     element={<ViewAttendance />} />
            <Route path="/admin/my-attendance"       element={<Staffview />} />
            <Route path="/admin/subjectmark"         element={<Exam />} />
            <Route path="/admin/examtype"            element={<ExamType />} />
            <Route path="/admin/examportion"         element={<ExamPortion />} />
            <Route path="/admin/examresult"          element={<Examresult />} />
            <Route path="/admin/reports"             element={<ReportsOverview />} />
            <Route path="/admin/reports/assignment"  element={<AssignmentReport />} />
            <Route path="/admin/reports/exam"        element={<ExamReport />} />
            <Route path="/admin/reports/attendance"  element={<AttendanceReport />} />
            <Route path="/admin/reports/homework"    element={<HomeworkReport />} />
            <Route path="/admin/leave"               element={<LeaveManagement />} />
            <Route path="/admin/settings"            element={<SettingsPage />} />
            <Route path="/releiving/:id"             element={<Registration />} />
            <Route path="/admin/class&section"       element={<Master/>} />
            <Route path="/admin/classTeacher"        element={<Master/>}/>
            <Route path="/admin/subjectTeacher"        element={<Master/>}/>
            <Route path="/admin/periodSlot"       element={<Master/>} />
            <Route path="/admin/classTimetable"        element={<Master/>}/>
            <Route path="/admin/periodTimetable"        element={<Master/>}/>
          </Routes>
        </div>
      </main>
    </div>
  );
};

const SettingsPage = () => (
  <div style={{ padding: "28px 32px" }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Settings</h2>
    <p style={{ color: "#64748b" }}>School configuration and preferences.</p>
  </div>
);

export default Nav;
