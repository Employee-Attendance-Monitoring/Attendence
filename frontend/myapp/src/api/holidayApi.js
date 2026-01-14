import api from "./axios";

// GET all holidays
export const getHolidays = () => {
  return api.get("/holidays/");
};

// CREATE holiday (ADMIN)
export const createHoliday = (data) => {
  return api.post("/holidays/create/", data);
};

// DELETE holiday (ADMIN)
export const deleteHoliday = (id) => {
  return api.delete(`/holidays/${id}/`);
};
