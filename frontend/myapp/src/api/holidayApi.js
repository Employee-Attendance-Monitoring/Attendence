import api from "./axios";

/* ===== MANUAL HOLIDAYS ===== */
export const getHolidays = () => api.get("/holidays/");
export const createHoliday = (data) => api.post("/holidays/", data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}/`);

/* ===== HOLIDAY CALENDAR ===== */
export const getHolidayCalendar = () =>
  api.get("/holidays/calendar/");

export const uploadHolidayCalendar = (formData) =>
  api.post("/holidays/calendar/", formData);
