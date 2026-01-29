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
// ================= LEAVE TYPES =================
export const getLeaveTypes = () => {
  return api.get("/leaves/leave-types/");
};

/* ================= LEAVE TYPES (ADMIN) ================= */

// Admin: get all leave types (active + inactive)
export const getAdminLeaveTypes = () =>
  api.get("/leaves/admin/leave-types/");

// Admin: add leave type
export const addLeaveType = (data) =>
  api.post("/leaves/admin/leave-types/", data);

// Admin: update leave type (edit name / enable-disable)
export const updateLeaveType = (id, data) =>
  api.put(`/leaves/admin/leave-types/${id}/`, data);

// Admin: delete leave type
export const deleteLeaveType = (id) =>
  api.delete(`/leaves/admin/leave-types/${id}/`);


