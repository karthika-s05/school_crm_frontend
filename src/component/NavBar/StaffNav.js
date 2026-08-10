import React, { useState, useRef, useEffect } from "react";
import "./nav.css";
import "./StaffNav.css";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiChevronLeft, FiChevronRight, FiX, FiCheck } from "react-icons/fi";
import { getUserData, removeToken, getToken } from "../../services/auth";
import {
  getMyClassTeacherClassesV2,
  markNotificationAsRead,
  updateNotificationTime,
} from "../../services/api";
import useNavNotifications from "../../hooks/useNavNotifications";
import { formatApiDateTime, formatRelativeTime } from "../../utils/date";
import { emitNotificationsChanged } from "../../utils/notificationBus";
import StaffDashboard from "../StaffDashboard/Dashboard";
import Assignment from "../Assignment/Assignment";
import Homework from "../Homework/Homework";
import StudentAttendanceEntry from "../../pages/attendance/StudentAttendanceEntry";
import StudentAttendanceView from "../../pages/attendance/StudentAttendanceView";
import MyStaffAttendance from "../../pages/attendance/MyStaffAttendance";
import LeaveManagement from "../../pages/services/LeaveManagement";
import NotificationCenter from "../../pages/notifications/NotificationCenter";
import Event from "../../pages/Event/Event";
import Timetable from "../../pages/Timetable/timetable";
import ExamPortion from "../../pages/exam/ExamPortion";
import Exam from "../../pages/exam/exam";
import Examresult from "../../pages/exam/examResults";
import ExamReport from "../../pages/report/ExamReport";
import AssignmentReport from "../../pages/report/AssignmentReport";
import AttendanceReportDashboard from "../../pages/attendance/AttendanceReportDashboard";
import HomeworkReport from "../../pages/report/HomeworkReport";
import ReportsOverview from "../../pages/report/ReportsOverview";
import Profile from "../../pages/profile/profile";
import Settings from "../../pages/settings/Settings";
import "../../assets/illustrations/schoolTheme.css";
import { SchoolAmbience } from "../../assets/illustrations/SchoolIllustrations";
import {
  SchoolMenuIcon, SchoolSubMenuIcon, IconChevronDown,
  IconSidebarCollapse, IconSidebarExpand, IconLogout, IconSettings, HeaderStationeryDeco,
} from "../../assets/illustrations/SchoolMenuIcons";

const STAFF_MENU_GROUPS = [
  {
    title: "Attendance", icon: null, section: "Academics",
    items: [
      { label: "Mark Attendance", path: "/staff/attendance", state: undefined },
      { label: "View Attendance", path: "/staff/view-attendance", state: undefined },
      { label: "My Attendance", path: "/staff/my-attendance", state: undefined },
    ],
  },
  {
    title: "Homework", icon: null,
    items: [
      { label: "Homework", path: "/staff/homework", state: undefined },
    ],
  },
  {
    title: "Assignment", icon: null,
    items: [
      { label: "Assignment", path: "/staff/assignment", state: undefined },
    ],
  },
  {
    title: "Timetable", icon: null,
    items: [
      { label: "My Timetable", path: "/staff/timetable", state: undefined },
    ],
  },
  {
    title: "Examination", icon: null,
    items: [
      { label: "Exam Timetable", path: "/staff/examportion", state: undefined },
      { label: "Enter Marks", path: "/staff/subjectmark", state: undefined },
      { label: "Exam Results", path: "/staff/examresult", state: undefined },
    ],
  },
  {
    title: "Communication", icon: null, section: "Communication",
    items: [
      { label: "Parent Meetings", path: "/staff/events", state: undefined },
    ],
  },
  {
    title: "Leave", icon: null, section: "Services",
    items: [
      { label: "Leave Management", path: "/staff/leave", state: undefined },
    ],
  },
  {
    title: "Reports", icon: null, section: "Reports",
    items: [
      { label: "Reports Overview", path: "/staff/reports", state: undefined },
      { label: "Assignment Report", path: "/staff/reports/assignment", state: undefined },
      { label: "Exam Report", path: "/staff/reports/exam", state: undefined },
      { label: "Attendance Report", path: "/staff/reports/attendance", state: undefined },
      { label: "Homework Report", path: "/staff/reports/homework", state: undefined },
    ],
  },
];

const resolveStaffPageTitle = (pathname) => {
  if (pathname === "/staff/dashboard" || pathname === "/") return { title: "Dashboard", parent: "Home" };
  if (pathname === "/staff/notifications") return { title: "Notifications", parent: "Home" };
  if (pathname === "/staff/events") return { title: "Parent Meetings", parent: "Communication" };
  for (const group of STAFF_MENU_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname) return { title: item.label, parent: group.title };
    }
  }
  return { title: "Dashboard", parent: "Home" };
};

const StaffMenuGroup = ({ title, items, openMenu, setOpenMenu, collapsed, pathname, onFlyoutNavigate }) => {
  const btnRef = useRef(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const isOpen = openMenu === title;
  const hasActiveChild = items.some(item => item.path === pathname);

  const handleToggle = () => {
    if (collapsed) {
      if (!isOpen && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setFlyoutTop(rect.top);
      }
    }
    setOpenMenu(isOpen ? null : title);
  };

  const subLinks = items.map((item, i) => {
    const isSubActive = item.path === pathname;
    return (
      <Link
        key={i}
        to={item.path}
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
        {!collapsed && <IconChevronDown className={`crm-arrow${isOpen ? " rotate" : ""}`} />}
        {hasActiveChild && collapsed && <span className="crm-active-dot" />}
      </button>

      {!collapsed && isOpen && <div className="crm-submenu">{subLinks}</div>}

      {collapsed && isOpen && (
        <div className="crm-submenu-flyout" style={{ top: flyoutTop }}>
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

const StaffNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const { title: pageTitle, parent: pageParent } = resolveStaffPageTitle(pathname);

  const staffName = getUserData("staffName") || getUserData("employeeName") || "Staff";
  const designation = getUserData("designation") || "Teacher";
  const staffId = getUserData("userName") || "";

  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [calDate, setCalDate] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [classTeacherClasses, setClassTeacherClasses] = useState([]);
  const { notifications, unreadCount, setNotifications } = useNavNotifications();

  const calRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const today = new Date();

  const classTeacherLabel = classTeacherClasses
    .map((row) =>
      [row.className, row.sectionName].filter(Boolean).join(" · ")
    )
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;
    let active = true;
    getMyClassTeacherClassesV2(token)
      .then((res) => {
        if (!active) return;
        setClassTeacherClasses(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setClassTeacherClasses([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (collapsed && openMenu) {
        const inside = e.target.closest(".crm-menu-group") || e.target.closest(".crm-submenu-flyout");
        if (!inside) setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [collapsed, openMenu]);

  useEffect(() => {
    if (collapsed) { setOpenMenu(null); return; }
    const match = STAFF_MENU_GROUPS.find(g => g.items.some(item => item.path === pathname));
    setOpenMenu(match ? match.title : null);
  }, [pathname, collapsed]);

  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const isToday = (d) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const dateLabel = today.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  const markAllRead = () => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    const token = getToken();
    if (token) {
      updateNotificationTime(token)
        .then(() => emitNotificationsChanged())
        .catch(() => {});
    }
  };
  const markRead = (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    const token = getToken();
    if (token) {
      markNotificationAsRead(id, token)
        .then(() => emitNotificationsChanged())
        .catch(() => {});
    }
  };
  const logout = () => { removeToken(); navigate("/", { replace: true }); };
  const closeFlyout = () => { if (collapsed) setOpenMenu(null); };

  const isDashboardActive = pathname === "/staff/dashboard" || pathname === "/";
  const isSettingsActive = pathname === "/staff/settings";
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
              <span>Staff Portal</span>
            </div>
          )}
        </div>

        {/* Staff Profile Card in Sidebar */}
        {/* {!collapsed && (
          <div className="staff-sidebar-profile">
            <div className="staff-sidebar-avatar">{staffName.charAt(0)}</div>
            <div className="staff-sidebar-info">
              <strong>{staffName}</strong>
              <span>{designation}</span>
            </div>
          </div>
        )} */}

        <nav className="crm-nav">
          <Link
            to="/staff/dashboard"
            className={`crm-link${isDashboardActive ? " active" : ""}`}
            title={collapsed ? "Dashboard" : undefined}
          >
            <span className="crm-menu-icon"><SchoolMenuIcon name="Dashboard" /></span>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {STAFF_MENU_GROUPS.map((group, i) => {
            const showSection = group.section && !renderedSections.has(group.section);
            if (showSection) renderedSections.add(group.section);
            return (
              <React.Fragment key={i}>
                {showSection && (
                  <div className="crm-section">{!collapsed && group.section}</div>
                )}
                <StaffMenuGroup
                  title={group.title}
                  items={group.items}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  collapsed={collapsed}
                  pathname={pathname}
                  onFlyoutNavigate={closeFlyout}
                />
              </React.Fragment>
            );
          })}
        </nav>

        <div className="crm-sidebar-footer">
          <Link
            to="/staff/settings"
            className={`crm-link crm-settings-link${isSettingsActive ? " active" : ""}`}
            title={collapsed ? "Settings" : undefined}
          >
            <span className="crm-menu-icon"><IconSettings /></span>
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>

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
            <div className="crm-search">
              <FiSearch />
              <input placeholder="Search students, homework, assignments..." />
            </div>

            <div className="crm-date-wrap" ref={calRef}>
              <button className="crm-date-btn" onClick={() => setShowCal(v => !v)}>
                <i className="bx bx-calendar crm-date-icon"></i>
                <span className="crm-date-text">{dateLabel}</span>
              </button>
              {showCal && (
                <div className="crm-cal-popup">
                  <div className="crm-cal-header">
                    <button className="crm-cal-nav" onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))}><FiChevronLeft /></button>
                    <span className="crm-cal-title">{MONTHS[calMonth]} {calYear}</span>
                    <button className="crm-cal-nav" onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))}><FiChevronRight /></button>
                  </div>
                  <div className="crm-cal-days">
                    {DAYS.map(d => <span key={d} className="crm-cal-day-hdr">{d}</span>)}
                  </div>
                  <div className="crm-cal-grid">
                    {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => (
                      <button key={i} className={`crm-cal-cell${isToday(i + 1) ? " today" : ""}`} onClick={() => setShowCal(false)}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="crm-cal-footer">
                    <button className="crm-cal-today-btn" onClick={() => { setCalDate(new Date()); setShowCal(false); }}>Today</button>
                  </div>
                </div>
              )}
            </div>

            <button className="crm-notification" onClick={() => setShowNotif(v => !v)}>
              <FiBell />
              {unreadCount > 0 && <span className="crm-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </button>

            <div className="crm-header-profile" ref={profileRef}>
              <button
                type="button"
                className={`crm-user crm-user-avatar-btn${showProfile ? " open" : ""}`}
                onClick={() => setShowProfile(v => !v)}
                aria-expanded={showProfile}
                aria-label="Open profile menu"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx-dp4uGCohdJKwWhlWiiQvwaxGRTHaML-EA&s"
                  alt={staffName}
                />
              </button>
              {showProfile && (
                <div className="crm-profile-menu">
                  <div className="crm-profile-menu-user">
                    <h4>{staffName}</h4>
                    <p>{designation}</p>
                    {classTeacherLabel ? (
                      <p className="crm-profile-class-teacher">
                        Class Teacher · {classTeacherLabel}
                      </p>
                    ) : null}
                  </div>
                  {staffId ? (
                    <button
                      type="button"
                      className="crm-profile-menu-link"
                      onClick={() => {
                        setShowProfile(false);
                        navigate(`/staff/profile/${staffId}`, {
                          state: "Staff List",
                        });
                      }}
                    >
                      My Profile
                    </button>
                  ) : null}
                  <button type="button" onClick={logout}><IconLogout /> Logout</button>
                </div>
              )}
            </div>
          </div>

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
                </div>
                <div className="crm-nd-list">
                  {notifications.length === 0 ? (
                    <div className="crm-nd-empty">
                      <i className="bx bx-bell-off"></i>
                      <p>No notifications</p>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`crm-nd-item${n.read ? "" : " unread"}`} onClick={() => markRead(n.id)}>
                      <div className="crm-nd-item-icon" style={{ background: n.bg, color: n.color }}>
                        <i className={n.icon}></i>
                      </div>
                      <div className="crm-nd-item-body">
                        <div className="crm-nd-item-top">
                          <span className="crm-nd-item-title">{n.title}</span>
                          {!n.read && <span className="crm-nd-unread-dot"></span>}
                        </div>
                        <p className="crm-nd-item-desc">{n.desc}</p>
                        <span
                          className="crm-nd-item-time"
                          title={formatApiDateTime(n.time)}
                        >
                          {formatRelativeTime(n.time)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {notifications.length > 0 && (
                  <div className="crm-nd-footer">
                    <button
                      className="crm-nd-view-all"
                      onClick={() => { setShowNotif(false); navigate("/staff/notifications"); }}
                    >
                      View all notifications <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="crm-page">
          <Routes>
            <Route path="/" element={<StaffDashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/notifications" element={<NotificationCenter />} />
            <Route path="/staff/attendance" element={<StudentAttendanceEntry />} />
            <Route path="/staff/view-attendance" element={<StudentAttendanceView />} />
            <Route path="/staff/my-attendance" element={<MyStaffAttendance />} />
            <Route path="/staff/homework" element={<Homework />} />
            <Route path="/staff/assignment" element={<Assignment />} />
            <Route path="/staff/timetable" element={<Timetable />} />
            <Route path="/staff/examportion" element={<ExamPortion />} />
            <Route path="/staff/subjectmark" element={<Exam />} />
            <Route path="/staff/examresult" element={<Examresult />} />
            <Route path="/staff/leave" element={<LeaveManagement />} />
            <Route path="/staff/events" element={<Event />} />
            <Route path="/staff/reports" element={<ReportsOverview />} />
            <Route path="/staff/reports/assignment" element={<AssignmentReport />} />
            <Route path="/staff/reports/exam" element={<ExamReport />} />
            <Route path="/staff/reports/attendance" element={<AttendanceReportDashboard />} />
            <Route path="/staff/reports/homework" element={<HomeworkReport />} />
            <Route path="/staff/profile/:id" element={<Profile />} />
            <Route path="/staff/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};



export default StaffNav;
