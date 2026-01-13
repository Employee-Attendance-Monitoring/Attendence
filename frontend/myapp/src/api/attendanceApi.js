import api from "./axios";

export const getAdminAttendanceReport = (date) =>
  api.get(`/attendance/admin-report/?date=${date}`);

export const employeeSignIn = () =>
  api.post("/attendance/sign-in/");

export const employeeSignOut = () =>
  api.post("/attendance/sign-out/");

export const getMyAttendance = () =>
  api.get("/attendance/my/");
export const getMyAttendanceReport = (month) =>
  api.get(`/attendance/my-report/?month=${month}`);


export const signIn = () => api.post("/attendance/sign-in/");
export const signOut = () => api.post("/attendance/sign-out/");
export const getTodayAttendance = () => api.get("/attendance/today/");


// Admin dashboard summary stats
export const getAdminDashboardStats = () =>
  api.get("/attendance/admin-dashboard/");
