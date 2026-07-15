import React from "react";
import { BiSolidBusSchool } from "react-icons/bi";
import { BsPaperclip } from "react-icons/bs";
import {
  LuNotebookPen,
  LuPencil,
  LuRuler,
  LuPen,
  LuBookOpen,
  LuEraser,
  LuHighlighter,
  LuLayoutDashboard,
  LuCalendarDays,
  LuClipboardList,
  LuChartBar,
  LuList,
  LuUserPlus,
  LuGlobe,
  LuMap,
  LuBuilding2,
  LuDroplet,
  LuUsers,
  LuChurch,
  LuGraduationCap,
  LuLayoutGrid,
  LuNetwork,
  LuUserCheck,
  LuPresentation,
  LuClock,
  LuTable,
  LuCalendarRange,
  LuTags,
  LuBookMarked,
  LuPenLine,
  LuTrophy,
  LuSettings,
  LuSquareCheck,
  LuClipboardCheck,
  LuCalendarCheck,
  LuBriefcase,
  LuPartyPopper,
  LuFileText,
} from "react-icons/lu";
import { MdAssignment, MdAssessment } from "react-icons/md";
import { PiStudentBold, PiChalkboardTeacherBold } from "react-icons/pi";
import { TbSettings } from "react-icons/tb";
import { FiChevronDown, FiLogOut } from "react-icons/fi";
import { IoChevronBackCircle, IoChevronForwardCircle } from "react-icons/io5";

const MENU_SIZE = 22;
const SUB_SIZE = 16;

function MenuIcon({ Icon, className, size = MENU_SIZE }) {
  return (
    <Icon
      className={`school-menu-icon react-menu-icon ${className || ""}`}
      size={size}
      aria-hidden="true"
    />
  );
}

function SubIcon({ Icon, className }) {
  return <Icon className={className} size={SUB_SIZE} aria-hidden="true" />;
}

/*  Main menu icons  */

export function IconDashboard({ className }) {
  return <MenuIcon Icon={LuLayoutDashboard} className={className} />;
}

export function IconStudent({ className }) {
  return <MenuIcon Icon={PiStudentBold} className={className} />;
}

export function IconStaff({ className }) {
  return <MenuIcon Icon={PiChalkboardTeacherBold} className={className} />;
}

export function IconMaster({ className }) {
  return <MenuIcon Icon={TbSettings} className={className} />;
}

export function IconMapping({ className }) {
  return <MenuIcon Icon={LuNetwork} className={className} />;
}

export function IconTimetable({ className }) {
  return <MenuIcon Icon={LuCalendarDays} className={className} />;
}

export function IconExam({ className }) {
  return <MenuIcon Icon={LuClipboardList} className={className} />;
}

export function IconReports({ className }) {
  return <MenuIcon Icon={LuChartBar} className={className} />;
}

export function IconSettings({ className }) {
  return <MenuIcon Icon={LuSettings} className={className} />;
}

/*  Stationery & Transport (user-defined)  */

export function StationeryKit({ className = "", size = "md" }) {
  const iconSize = size === "sm" ? 10 : 11;
  return (
    <div className={`stationery-kit stationery-kit--${size} ${className}`} aria-hidden="true">
      <LuNotebookPen size={iconSize} title="Notebook and Pen" />
      <LuPencil size={iconSize} title="Pencil" />
      <BsPaperclip size={iconSize} title="Paperclip" />
      <LuRuler size={iconSize} title="Ruler" />
    </div>
  );
}

export function IconStationery({ className }) {
  return <StationeryKit className={`school-menu-icon ${className || ""}`} size="md" />;
}

export function IconSubStationery({ className }) {
  return <StationeryKit className={className} size="sm" />;
}

/** Floating grey stationery icons - school ambience in header */
export function HeaderStationeryDeco() {
  const items = [
    { Icon: LuNotebookPen, top: "25%", left: "18%",  size: 28, delay: 0,    rotate: -10 },
    { Icon: LuPen,         top: "58%", left: "26%",  size: 22, delay: -1.2, rotate: 14 },
    { Icon: LuPencil,      top: "8%",  left: "36%",  size: 24, delay: -2.4, rotate: -6 },
    { Icon: LuBookOpen,    top: "52%", left: "44%",  size: 26, delay: -0.8, rotate: 8 },
    { Icon: BsPaperclip,   top: "16%", left: "52%",  size: 20, delay: -3.2, rotate: -12 },
    { Icon: LuRuler,       top: "48%", left: "60%",  size: 30, delay: -1.8, rotate: 5 },
    { Icon: LuEraser,      top: "10%", left: "68%",  size: 22, delay: -2.8, rotate: -8 },
    { Icon: LuHighlighter, top: "54%", left: "76%",  size: 24, delay: -4.0, rotate: 10 },
    { Icon: LuGraduationCap, top: "20%", left: "84%", size: 26, delay: -1.5, rotate: -5 },
  ];

  return (
    <div className="crm-header-stationery" aria-hidden="true">
      {items.map(({ Icon, top, left, size, delay, rotate }, i) => (
        <span
          key={i}
          className="crm-header-float-icon"
          style={{
            top,
            left,
            "--float-rotate": `${rotate}deg`,
            animationDelay: `${delay}s`,
          }}
        >
          <Icon size={size} />
        </span>
      ))}
    </div>
  );
}

export function IconTransport({ className }) {
  return <BiSolidBusSchool className={`school-menu-icon ${className || ""}`} size={MENU_SIZE} aria-hidden="true" />;
}

export function IconSubTransport({ className }) {
  return <BiSolidBusSchool className={className} size={SUB_SIZE} aria-hidden="true" />;
}

/*  Sidebar UI icons  */

export function IconChevronDown({ className }) {
  return <FiChevronDown className={className} size={18} aria-hidden="true" />;
}

export function IconSidebarCollapse({ className }) {
  return <IoChevronBackCircle className={className} size={32} aria-hidden="true" />;
}

export function IconSidebarExpand({ className }) {
  return <IoChevronForwardCircle className={className} size={32} aria-hidden="true" />;
}

export function IconLogout({ className }) {
  return <FiLogOut className={className} size={18} aria-hidden="true" />;
}

/*  Submenu icons  */

const SUBMENU_ICON_MAP = {
  "Student List":        (p) => <SubIcon Icon={LuList} {...p} />,
  "Staff List":          (p) => <SubIcon Icon={LuList} {...p} />,
  "Registration":        (p) => <SubIcon Icon={LuUserPlus} {...p} />,
  "Nationality":         (p) => <SubIcon Icon={LuGlobe} {...p} />,
  "State":               (p) => <SubIcon Icon={LuMap} {...p} />,
  "City":                (p) => <SubIcon Icon={LuBuilding2} {...p} />,
  "Blood Group":         (p) => <SubIcon Icon={LuDroplet} {...p} />,
  "Community":           (p) => <SubIcon Icon={LuUsers} {...p} />,
  "Religion":            (p) => <SubIcon Icon={LuChurch} {...p} />,
  "Subject":             (p) => <SubIcon Icon={LuBookOpen} {...p} />,
  "Class":               (p) => <SubIcon Icon={LuGraduationCap} {...p} />,
  "Section":             (p) => <SubIcon Icon={LuLayoutGrid} {...p} />,
  "Class & Section":     (p) => <SubIcon Icon={LuLayoutGrid} {...p} />,
  "Class Teacher":       (p) => <SubIcon Icon={LuUserCheck} {...p} />,
  "Subject Teacher":     (p) => <SubIcon Icon={LuPresentation} {...p} />,
  "Period Slot":         (p) => <SubIcon Icon={LuClock} {...p} />,
  "Class Time Table":    (p) => <SubIcon Icon={LuTable} {...p} />,
  "Period Time Table":   (p) => <SubIcon Icon={LuCalendarRange} {...p} />,
  "Exam Type":           (p) => <SubIcon Icon={LuTags} {...p} />,
  "Exam Portion":        (p) => <SubIcon Icon={LuBookMarked} {...p} />,
  "Subject Mark":        (p) => <SubIcon Icon={LuPenLine} {...p} />,
  "Exam Result":         (p) => <SubIcon Icon={LuTrophy} {...p} />,
  "Stationery":          (p) => <IconSubStationery {...p} />,
  "Transport":           (p) => <IconSubTransport {...p} />,
  "Assignment Report":   (p) => <SubIcon Icon={MdAssignment} {...p} />,
  "Exam Report":         (p) => <SubIcon Icon={MdAssessment} {...p} />,
  /* Staff submenu */
  "Mark Attendance":     (p) => <SubIcon Icon={LuSquareCheck} {...p} />,
  "View Attendance":     (p) => <SubIcon Icon={LuClipboardList} {...p} />,
  "My Timetable":        (p) => <SubIcon Icon={LuCalendarDays} {...p} />,
  "Leave Management":    (p) => <SubIcon Icon={LuBriefcase} {...p} />,
  "Reports Overview":    (p) => <SubIcon Icon={LuChartBar} {...p} />,
  "Attendance Report":   (p) => <SubIcon Icon={LuClipboardCheck} {...p} />,
  "Homework Report":     (p) => <SubIcon Icon={LuNotebookPen} {...p} />,
  /* Student submenu */
  "My Attendance":       (p) => <SubIcon Icon={LuCalendarCheck} {...p} />,
  "Exam Results":        (p) => <SubIcon Icon={LuTrophy} {...p} />,
  "School Events":       (p) => <SubIcon Icon={LuPartyPopper} {...p} />,
};

export function SchoolSubMenuIcon({ label, className }) {
  const Cmp = SUBMENU_ICON_MAP[label] || ((p) => <SubIcon Icon={LuList} {...p} />);
  return <Cmp className={className} />;
}

/* ── Staff & Student menu icons ── */

export function IconAttendance({ className }) {
  return <MenuIcon Icon={LuSquareCheck} className={className} />;
}

export function IconHomework({ className }) {
  return <MenuIcon Icon={LuNotebookPen} className={className} />;
}

export function IconAssignment({ className }) {
  return <MenuIcon Icon={LuClipboardCheck} className={className} />;
}

export function IconLeave({ className }) {
  return <MenuIcon Icon={LuBriefcase} className={className} />;
}

export function IconEvents({ className }) {
  return <MenuIcon Icon={LuPartyPopper} className={className} />;
}

export function IconProfile({ className }) {
  return <MenuIcon Icon={LuFileText} className={className} />;
}

export const MENU_ICON_MAP = {
  /* Admin */
  Dashboard:      IconDashboard,
  Student:        IconStudent,
  Staff:          IconStaff,
  Master:         IconMaster,
  Mapping:        IconMapping,
  "Time Table":   IconTimetable,
  Examination:    IconExam,
  Stationery:     IconStationery,
  Transport:      IconTransport,
  Reports:        IconReports,
  /* Staff & Student shared */
  Attendance:     IconAttendance,
  Homework:       IconHomework,
  Assignment:     IconAssignment,
  Timetable:      IconTimetable,
  Leave:          IconLeave,
  Events:         IconEvents,
  Profile:        IconProfile,
};

export function SchoolMenuIcon({ name, className }) {
  const Cmp = MENU_ICON_MAP[name];
  if (!Cmp) return null;
  return <Cmp className={className} />;
}
