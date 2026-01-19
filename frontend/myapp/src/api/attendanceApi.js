import api from "./axios";

/* ================= EMPLOYEE ================= */

// Sign in (once per day)
export const employeeSignIn = () =>
  api.post("/attendance/signin/");

// Sign out
export const employeeSignOut = () =>
  api.post("/attendance/signout/");

// Attendance history (table)
export const getMyAttendanceHistory = () =>
  api.get("/attendance/my-history/");

// Attendance summary (counts)
export const getMyAttendanceSummary = () =>
  api.get("/attendance/my-summary/");


/* ================= ADMIN ================= */

// Admin attendance report (filter by date / user_id)
// attendanceApi.js
export const getAdminAttendanceReport = ({ date, employee }) => {
  const params = new URLSearchParams();

  if (date) params.append("date", date);
  if (employee) params.append("employee", employee);

  return api.get(`/attendance/admin-report/?${params.toString()}`);
};

