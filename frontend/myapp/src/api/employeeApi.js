import api from "./axios";

export const getMyProfile = () =>
  api.get("/employees/me/");

