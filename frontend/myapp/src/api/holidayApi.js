import api from "./axios";

export const getHolidays = () =>
  api.get("/holidays/");

export const createHoliday = (data) =>
  api.post("/holidays/", data);

export const deleteHoliday = (id) =>
  api.delete(`/holidays/${id}/`);
