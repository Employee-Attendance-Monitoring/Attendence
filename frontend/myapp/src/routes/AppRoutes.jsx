import { Routes, Route, Navigate } from "react-router-dom";

/* ---------- AUTH ---------- */
import Login from "../auth/Login";
import ProtectedRoute from "../auth/ProtectedRoute";

/* ---------- LAYOUTS ---------- */
import AdminLayout from "../layouts/AdminLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";

/* ---------- ADMIN PAGES ---------- */
import AdminDashboard from "../admin/dashboard/AdminDashboard";
import EmployeeList from "../admin/employees/EmployeeList";
import AddEmployee from "../admin/employees/AddEmployee";
import EditEmployee from "../admin/employees/EditEmployee";
import EmployeeView from "../admin/employees/EmployeeView";
import EmployeeRelieve from "../admin/employees/EmployeeRelieve";

import AdminAttendancePage from "../admin/attendance/AdminAttendancePage";
import HolidayManagement from "../admin/holidays/HolidayManagement";
import LeaveBalancePage from "../admin/leaves/LeaveBalancePage";
import OrganizationPage from "../admin/organization/OrganizationPage";

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

          {/* Employees */}
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/edit/:id" element={<EditEmployee />} />
          <Route path="employees/view/:id" element={<EmployeeView />} />
          <Route
            path="employees/relieve/:empId"
            element={<EmployeeRelieve />}
          />

          {/* Other Admin Pages */}
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="holidays" element={<HolidayManagement />} />
          <Route path="leave-balance" element={<LeaveBalancePage />} />
          <Route path="organization" element={<OrganizationPage />} />
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
