export const EXAM_TYPES = [
  { id: 1, name: "Unit Test", description: "Short assessment covering recent topics", maxMarks: 50, status: "Active" },
  { id: 2, name: "Mid-Term Exam", description: "Half-yearly comprehensive examination", maxMarks: 100, status: "Active" },
  { id: 3, name: "Quarterly Exam", description: "Quarter-end evaluation", maxMarks: 100, status: "Active" },
  { id: 4, name: "Final Exam", description: "Annual board-style examination", maxMarks: 100, status: "Active" },
  { id: 5, name: "Practical Exam", description: "Lab and practical assessment", maxMarks: 30, status: "Active" },
];

export const EXAM_PORTIONS = [
  { id: 1, exam: "Mid-Term Exam", cls: "10", section: "A", subject: "Mathematics", examDate: "15-Sep-2024", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Chapters 1–5: Algebra, Trigonometry" },
  { id: 2, exam: "Mid-Term Exam", cls: "10", section: "A", subject: "Physics", examDate: "16-Sep-2024", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Mechanics, Laws of Motion, Work & Energy" },
  { id: 3, exam: "Mid-Term Exam", cls: "10", section: "B", subject: "Mathematics", examDate: "15-Sep-2024", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Chapters 1–5: Algebra, Trigonometry" },
  { id: 4, exam: "Mid-Term Exam", cls: "9", section: "A", subject: "Biology", examDate: "17-Sep-2024", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Cell Biology, Tissues, Plant Physiology" },
  { id: 5, exam: "Unit Test 1", cls: "8", section: "A", subject: "Science", examDate: "05-Jul-2024", fromTime: "10:00 AM", toTime: "11:30 AM", portion: "Force, Pressure, Friction" },
  { id: 6, exam: "Final Exam", cls: "12", section: "A", subject: "Chemistry", examDate: "10-Mar-2025", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Organic Chemistry, Electrochemistry" },
  { id: 7, exam: "Final Exam", cls: "11", section: "B", subject: "Maths", examDate: "12-Mar-2025", fromTime: "09:00 AM", toTime: "12:00 PM", portion: "Calculus, Probability, Linear Programming" },
  { id: 8, exam: "Unit Test 2", cls: "7", section: "C", subject: "English", examDate: "20-Nov-2024", fromTime: "10:00 AM", toTime: "11:30 AM", portion: "Grammar, Comprehension, Essay Writing" },
];

export const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Science", "History", "Computer",
];

export const STUDENTS = [
  { id: "KST2024001", name: "Aarav Sharma" },
  { id: "KST2024002", name: "Priya Nair" },
  { id: "KST2024003", name: "Rohan Verma" },
  { id: "KST2024004", name: "Sneha Patel" },
  { id: "KST2024005", name: "Karthik Rajan" },
  { id: "KST2024006", name: "Divya Krishnan" },
];

export const CLASSES = ["6", "7", "8", "9", "10", "11", "12"];
export const SECTIONS = ["A", "B", "C"];

export const EXAM_RESULTS = [
  { id: 1, student: "Aarav Sharma", admNo: "KST2024001", examName: "Mid-Term Exam", className: "10", sectionName: "A", subjectName: "Mathematics", mark: 92, remarks: "Excellent", total: 100, result: "Pass" },
  { id: 2, student: "Aarav Sharma", admNo: "KST2024001", examName: "Mid-Term Exam", className: "10", sectionName: "A", subjectName: "Physics", mark: 88, remarks: "Very Good", total: 100, result: "Pass" },
  { id: 3, student: "Aarav Sharma", admNo: "KST2024001", examName: "Mid-Term Exam", className: "10", sectionName: "A", subjectName: "Chemistry", mark: 78, remarks: "Good", total: 100, result: "Pass" },
  { id: 4, student: "Priya Nair", admNo: "KST2024002", examName: "Mid-Term Exam", className: "9", sectionName: "B", subjectName: "Mathematics", mark: 96, remarks: "Outstanding", total: 100, result: "Pass" },
  { id: 5, student: "Priya Nair", admNo: "KST2024002", examName: "Mid-Term Exam", className: "9", sectionName: "B", subjectName: "Biology", mark: 89, remarks: "Very Good", total: 100, result: "Pass" },
  { id: 6, student: "Rohan Verma", admNo: "KST2024003", examName: "Mid-Term Exam", className: "8", sectionName: "A", subjectName: "Mathematics", mark: 74, remarks: "Good", total: 100, result: "Pass" },
  { id: 7, student: "Rohan Verma", admNo: "KST2024003", examName: "Mid-Term Exam", className: "8", sectionName: "A", subjectName: "Science", mark: 68, remarks: "Average", total: 100, result: "Pass" },
  { id: 8, student: "Sneha Patel", admNo: "KST2024004", examName: "Mid-Term Exam", className: "10", sectionName: "B", subjectName: "Mathematics", mark: 85, remarks: "Very Good", total: 100, result: "Pass" },
  { id: 9, student: "Sneha Patel", admNo: "KST2024004", examName: "Mid-Term Exam", className: "10", sectionName: "B", subjectName: "English", mark: 91, remarks: "Excellent", total: 100, result: "Pass" },
  { id: 10, student: "Karthik Rajan", admNo: "KST2024005", examName: "Mid-Term Exam", className: "7", sectionName: "C", subjectName: "Mathematics", mark: 55, remarks: "Average", total: 100, result: "Pass" },
  { id: 11, student: "Karthik Rajan", admNo: "KST2024005", examName: "Mid-Term Exam", className: "7", sectionName: "C", subjectName: "Science", mark: 48, remarks: "Needs Imp.", total: 100, result: "Pass" },
  { id: 12, student: "Divya Krishnan", admNo: "KST2024006", examName: "Mid-Term Exam", className: "9", sectionName: "A", subjectName: "Mathematics", mark: 82, remarks: "Very Good", total: 100, result: "Pass" },
  { id: 13, student: "Divya Krishnan", admNo: "KST2024006", examName: "Mid-Term Exam", className: "9", sectionName: "A", subjectName: "Biology", mark: 94, remarks: "Outstanding", total: 100, result: "Pass" },
  { id: 14, student: "Ananya Iyer", admNo: "KST2024010", examName: "Mid-Term Exam", className: "7", sectionName: "A", subjectName: "Mathematics", mark: 38, remarks: "Reappear", total: 100, result: "Fail" },
  { id: 15, student: "Vikram Singh", admNo: "KST2024009", examName: "Mid-Term Exam", className: "10", sectionName: "C", subjectName: "Physics", mark: 72, remarks: "Good", total: 100, result: "Pass" },
];

export const EXAM_AGGREGATE = [
  { id: 1, student: "Aarav Sharma", exam: "Mid-Term Exam", class: "10", section: "A", grade: "A+", mark: 258, total: 300, rank: 1, remarks: "Excellent" },
  { id: 2, student: "Priya Nair", exam: "Mid-Term Exam", class: "9", section: "B", grade: "A+", mark: 185, total: 200, rank: 1, remarks: "Outstanding" },
  { id: 3, student: "Sneha Patel", exam: "Mid-Term Exam", class: "10", section: "B", grade: "A", mark: 176, total: 200, rank: 2, remarks: "Very Good" },
  { id: 4, student: "Divya Krishnan", exam: "Mid-Term Exam", class: "9", section: "A", grade: "A", mark: 176, total: 200, rank: 2, remarks: "Very Good" },
  { id: 5, student: "Rohan Verma", exam: "Mid-Term Exam", class: "8", section: "A", grade: "B+", mark: 142, total: 200, rank: 5, remarks: "Good" },
  { id: 6, student: "Vikram Singh", exam: "Mid-Term Exam", class: "10", section: "C", grade: "B", mark: 148, total: 200, rank: 4, remarks: "Good" },
  { id: 7, student: "Karthik Rajan", exam: "Mid-Term Exam", class: "7", section: "C", grade: "C", mark: 103, total: 200, rank: 8, remarks: "Average" },
  { id: 8, student: "Ananya Iyer", exam: "Mid-Term Exam", class: "7", section: "A", grade: "F", mark: 80, total: 200, rank: 10, remarks: "Reappear" },
];
