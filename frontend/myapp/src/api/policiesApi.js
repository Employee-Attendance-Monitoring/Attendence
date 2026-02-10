import api from "./axios";

// GET all policies (admin & employee)
export const getPolicies = () => {
  return api.get("policies/");
};

// ADMIN: create policy
export const createPolicy = (formData) => {
  return api.post("policies/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// EMPLOYEE: acknowledge policy
export const acknowledgePolicy = (policyId) => {
  return api.post(`policies/${policyId}/acknowledge/`);
};

export const deletePolicy = (id) => {
  return api.delete(`policies/${id}/`);
};

export const togglePolicyStatus = (id) =>
  api.patch(`/policies/${id}/toggle_status/`);