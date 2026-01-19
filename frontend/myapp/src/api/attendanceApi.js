import api from "./axios";

/* ================= EMPLOYEE ================= */

// Sign in
export const employeeSignIn = () =>
  api.post("/attendance/signin/");

// Sign out
export const employeeSignOut = () =>
  api.post("/attendance/signout/");

// Attendance history
export const getMyAttendanceHistory = () =>
  api.get("/attendance/my-history/");

// Attendance summary
export const getMyAttendanceSummary = () =>
  api.get("/attendance/my-summary/");


/* ================= ADMIN ================= */

// Admin attendance report
export const getAdminAttendanceReport = ({
  date,
  month,
  year,
  employee,
}) => {
  const params = new URLSearchParams();

  if (date) params.append("date", date);
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (employee) params.append("employee", employee);

  return api.get(`/attendance/admin-report/?${params.toString()}`);
};
