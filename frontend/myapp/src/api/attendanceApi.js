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
export const getAdminAttendanceReport = (queryParams) => {
  let params = {};

  if (queryParams.date) params.date = queryParams.date;
  if (queryParams.month) params.month = queryParams.month;

  // ✅ do NOT send "all"
  if (queryParams.employee && queryParams.employee !== "all") {
    params.employee = queryParams.employee;
  }

  if (queryParams.department && queryParams.department !== "ALL" && queryParams.department !== "all") {
    params.department = queryParams.department;
  }

  if (queryParams.status && queryParams.status !== "ALL") {
    params.status = queryParams.status;
  }

  return api.get("/attendance/admin-report/", { params });
};
