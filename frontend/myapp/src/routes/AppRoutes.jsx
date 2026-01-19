import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../auth/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

/* ---------- ADMIN PAGES ---------- */
import AdminDashboard from "../admin/dashboard/AdminDashboard";
import EmployeeList from "../admin/employees/EmployeeList";
import EditEmployee from "../admin/employees/EditEmployee";
import AddEmployee from "../admin/employees/AddEmployee";
import AttendanceReport from "../admin/attendance/AttendanceReport";
import HolidayManagement from "../admin/holidays/HolidayManagement";
import LeaveApproval from "../admin/leaves/LeaveApproval";

/* ---------- EMPLOYEE PAGES ---------- */
import EmployeeDashboard from "../employee/dashboard/EmployeeDashboard";
import MyProfile from "../employee/profile/MyProfile";
import MyAttendance from "../employee/attendance/MyAttendance";
import ApplyLeave from "../employee/leave/ApplyLeave";
import HolidayCalendar from "../employee/holiday/HolidayCalendar";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          {/* EMPLOYEES */}
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/edit/:id" element={<EditEmployee />} />

          {/* OTHER ADMIN */}
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="holidays" element={<HolidayManagement />} />
          <Route path="leaves" element={<LeaveApproval />} />
        </Route>
      </Route>

      {/* ================= EMPLOYEE ================= */}
      <Route element={<ProtectedRoute role="EMPLOYEE" />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="leave" element={<ApplyLeave />} />
          <Route path="holiday" element={<HolidayCalendar />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
