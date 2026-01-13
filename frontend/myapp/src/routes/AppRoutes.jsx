import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

import AdminDashboard from "../admin/dashboard/AdminDashboard";
import EmployeeList from "../admin/employees/EmployeeList";
import AddEmployee from "../admin/employees/AddEmployee";
import EditEmployee from "../admin/employees/EditEmployee";
import AttendanceReport from "../admin/attendance/AttendanceReport";
import LeaveApproval from "../admin/leaves/LeaveApproval";
import HolidayManagement from "../admin/holidays/HolidayManagement";

const AppRoutes = () => (
  <Routes>

    {/* DEFAULT */}
    <Route path="/" element={<Navigate to="/login" />} />

    {/* LOGIN */}
    <Route path="/login" element={<Login />} />

    {/* ADMIN */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute role="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="employees" element={<EmployeeList />} />
      <Route path="employees/add" element={<AddEmployee />} />
      <Route path="employees/edit/:id" element={<EditEmployee />} />
      <Route path="attendance" element={<AttendanceReport />} />
      <Route path="leaves" element={<LeaveApproval />} />
      <Route path="holidays" element={<HolidayManagement />} />
    </Route>

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
