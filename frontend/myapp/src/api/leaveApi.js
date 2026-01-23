import api from "./axios";

/* ================= EMPLOYEE ================= */

export const applyLeave = (data) =>
  api.post("/leaves/apply/", data);

export const getMyLeaves = () =>
  api.get("/leaves/my/");

export const getMyLeaveBalance = () =>
  api.get("/leaves/my-balance/");

/* ================= ADMIN ================= */

export const getAllLeaves = () =>
  api.get("/leaves/admin/");

export const updateLeaveStatus = (id, status) =>
  api.put(`/leaves/admin/${id}/`, { status });

export const getLeaveSummary = (email) =>
  api.get("/leaves/admin/leave-summary/", {
    params: { employee: email },
  });

/* ================= LEAVE BALANCE (ADMIN) ================= */

export const setLeaveBalance = (data) =>
  api.post("/leaves/admin/set-balance/", data);
