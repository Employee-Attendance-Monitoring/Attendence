import api from "./axios";

/* ================= EMPLOYEE ================= */

export const applyLeave = (data) =>
  api.post("/leaves/apply/", data);

export const getMyLeaves = () =>
  api.get("/leaves/my/");

/* ================= ADMIN ================= */

export const getAllLeaves = () =>
  api.get("/leaves/admin/");

export const updateLeaveStatus = (id, status) =>
  api.put(`/leaves/admin/${id}/`, { status });
