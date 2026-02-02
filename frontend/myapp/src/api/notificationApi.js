import api from "./axios";

export const getNotifications = () =>
  api.get("/notifications/");

export const markNotificationRead = (id) =>
  api.post(`/notifications/${id}/read/`);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}/delete/`);
