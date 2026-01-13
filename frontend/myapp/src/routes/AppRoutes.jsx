import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

const AppRoutes = () => (
  <Routes>

    {/* DEFAULT ROUTE */}
    <Route path="/" element={<Navigate to="/login" />} />

    {/* LOGIN */}
    <Route path="/login" element={<Login />} />

    {/* ADMIN */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute role="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      }
    />

    {/* EMPLOYEE */}
    <Route
      path="/employee/*"
      element={
        <ProtectedRoute role="EMPLOYEE">
          <EmployeeLayout />
        </ProtectedRoute>
      }
    />

    {/* FALLBACK */}
    <Route path="*" element={<Navigate to="/login" />} />

  </Routes>
);

export default AppRoutes;
