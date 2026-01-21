import api from "./axios";

export const getMyProfile = () =>
  api.get("/employees/me/");

export const getEmployeeEmails = () =>
  api.get("/employees/list/");

export const getEmployeeDropdown = () =>
  api.get("/employees/dropdown/");

export const getEmployeeById = (id) =>
  api.get(`/employees/${id}/`);

