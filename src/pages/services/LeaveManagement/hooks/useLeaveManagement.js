/* ─────────────────────────────────────────────
   useLeaveManagement.js - central data hook
───────────────────────────────────────────── */
import { useState, useCallback, useEffect } from "react";
import {
  createStaffLeave,
  createStudentLeave,
  getLeaveTypes,
  getStaffLeave,
  getMyStaffLeave,
  getStudentLeave,
  updateStaffLeaveStatus,
  updateStudentLeaveStatus,
} from "../../../../services/api";
import { getToken, getUserData } from "../../../../services/auth";
import { runApi } from "../../../../utils/apiHelper";
import { toast } from "react-toastify";

export function useLeaveManagement() {
  const token = getToken();
  const role = getUserData("role");
  const isAdmin = role === "Admin";
  const isStaff = role === "Staff" || role === "Admin";
  const isStudent = role === "Student";

  /* ── State ── */
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);   // logged-in user's own leaves
  const [studentLeaves, setStudentLeaves] = useState([]);   // approval list (staff/admin)
  const [staffLeaves, setStaffLeaves] = useState([]);   // approval list (admin only)
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ── Load all data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Always load leave types
      await runApi(() => getLeaveTypes(token), {
        onSuccess: (res) => setLeaveTypes(res.data || []),
      });

      if (isStudent) {
        // Student: only their own leaves (backend filters by JWT user)
        await runApi(() => getStudentLeave(token, 0, 0), {
          onSuccess: (res) => setMyLeaves(res.data || []),
        });
      } else if (isAdmin) {
        // Admin: own staff leaves + all staff leaves for approval
        const [myRes, staffRes, studentRes] = await Promise.all([
          runApi(() => getMyStaffLeave(token)), // My Leave History
          runApi(() => getStaffLeave(token)),   // All Staff Leaves
          runApi(() => getStudentLeave(token, 0, 0)),
        ]);
        // getMyStaffLeave already returns only the logged-in user's leaves
        setMyLeaves(myRes?.data || []);
        setStaffLeaves(staffRes?.data || []);
        setStudentLeaves(studentRes?.data || []);
      } else {
        // Staff: own leaves + student leaves for approval
        const [myRes, studentRes] = await Promise.all([
          runApi(() => getMyStaffLeave(token)),
          runApi(() => getStudentLeave(token, 0, 0)),
        ]);
        setMyLeaves(myRes?.data || []);
        setStudentLeaves(studentRes?.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [token, isStudent, isAdmin, isStaff]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Submit leave application ── */
  const submitLeave = useCallback(async (form) => {
    setSubmitting(true);
    const body = isStudent
      ? { startDate: form.startDate, endDate: form.endDate, reason: form.reason, leaveTypeId: form.leaveTypeId }
      : {
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        leaveTypeId: Number(form.leaveTypeId),
        leaveTime: form.leaveTime,
      };
    const fn = isStudent
      ? () => createStudentLeave(body, token)
      : () => createStaffLeave(body, token);

    const ok = await runApi(fn, {
      successMsg: "Leave request submitted successfully!",
    });
    setSubmitting(false);
    if (ok) { await loadData(); return true; }
    return false;
  }, [token, isStudent, loadData]);

  /* ── Approve / Reject leave ── */
  const updateLeaveStatus = useCallback(async (id, status, remarks, type) => {
    const fn = type === "student"
      ? () => updateStudentLeaveStatus({ id, status, remarks }, token)
      : () => updateStaffLeaveStatus({ id, status, remarks }, token);

    await runApi(fn, {
      successMsg: `Leave ${status.toLowerCase()} successfully`,
      onSuccess: loadData,
    });
  }, [token, loadData]);

  return {
    /* role flags */
    role, isAdmin, isStaff, isStudent,
    /* data */
    leaveTypes, myLeaves, studentLeaves, staffLeaves,
    /* status */
    loading, submitting,
    /* actions */
    loadData, submitLeave, updateLeaveStatus,
  };
}
