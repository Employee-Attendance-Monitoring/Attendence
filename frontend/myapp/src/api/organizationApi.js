import api from "./axios";

/* ================= ORGANIZATION ================= */

export const getOrganization = () =>
  api.get("/organization/");

export const createOrganization = (data) =>
  api.post("/organization/", data);

export const updateOrganization = (data) =>
  api.put("/organization/", data);


// * ================= ORGANIZATION REPORT ================= */

export const getOrganizationReport = () =>
  api.get("/organization/report/");

/* ================= DEPARTMENT ================= */

export const getDepartments = () =>
  api.get("/organization/departments/");

export const createDepartment = (data) =>
  api.post("/organization/departments/", data);

export const updateDepartment = (id, data) =>
  api.put(`/organization/departments/${id}/`, data);

export const deleteDepartment = (id) =>
  api.delete(`/organization/departments/${id}/`);

/* ================= ROLE ================= */

export const getRoles = () =>
  api.get("/organization/roles/");

export const createRole = (data) =>
  api.post("/organization/roles/", data);

export const updateRole = (id, data) =>
  api.put(`/organization/roles/${id}/`, data);

export const deleteRole = (id) =>
  api.delete(`/organization/roles/${id}/`);
