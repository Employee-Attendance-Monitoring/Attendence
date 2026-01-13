import api from "./axios";

export const applyLeave = (data) =>
  api.post("/leaves/apply/", data);

export const getMyLeaves = () =>
  api.get("/leaves/my/");

export const getAllLeaves = () =>
  api.get("/leaves/admin/");

export const updateLeaveStatus = (id, status) =>
  api.patch(`/leaves/${id}/status/`, { status });
