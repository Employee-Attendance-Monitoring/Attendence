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

// ✅ FIXED Admin attendance report
export const getAdminAttendanceReport = (
  date,
  employee,
  department,
  status
) => {
  let params = {};

  if (date) params.date = date;

  // ✅ do NOT send "all"
  if (employee && employee !== "all") {
    params.employee = employee;
  }

  if (department && department !== "ALL") {
    params.department = department;
  }

  if (status && status !== "ALL") {
    params.status = status;
  }

  return api.get("/attendance/admin-report/", { params });
};
