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
export const getAdminAttendanceReport = (date, employee) => {
  let url = "/attendance/admin-report/?";

  if (date) url += `date=${date}&`;
  if (employee) url += `employee=${employee}&`;

  return api.get(url);
};
