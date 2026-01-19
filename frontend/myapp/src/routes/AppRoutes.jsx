import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

import AdminDashboard from "../admin/dashboard/AdminDashboard";
import EmployeeList from "../admin/employees/EmployeeList";
import HolidayManagement from "../admin/holidays/HolidayManagement";
import LeaveApproval from "../admin/leaves/LeaveApproval";
import AttendanceReport from "../admin/attendance/AttendanceReport";

import EmployeeDashboard from "../employee/dashboard/EmployeeDashboard";
import MyProfile from "../employee/profile/MyProfile";
import MyAttendance from "../employee/attendance/MyAttendance";
import ApplyLeave from "../employee/leave/ApplyLeave";
import HolidayCalendar from "../employee/holiday/HolidayCalendar";

import ProtectedRoute from "../auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="holidays" element={<HolidayManagement />} />
          <Route path="leaves" element={<LeaveApproval />} />
        </Route>
      </Route>

      {/* EMPLOYEE ROUTES */}
      <Route element={<ProtectedRoute role="EMPLOYEE" />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="leave" element={<ApplyLeave />} />
          <Route path="holiday" element={<HolidayCalendar />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
