import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import AdminDashboard from "../admin/dashboard/AdminDashboard";
import EmployeeList from "../admin/employees/EmployeeList";
import AddEmployee from "../admin/employees/AddEmployee";
import EditEmployee from "../admin/employees/EditEmployee";
import AttendanceReport from "../admin/attendance/AttendanceReport";
import LeaveApproval from "../admin/leaves/LeaveApproval";
import HolidayManagement from "../admin/holidays/HolidayManagement";

const AdminLayout = () => {
  const links = [
    { label: "Dashboard", to: "/admin" },
    { label: "Employees", to: "/admin/employees" },
    { label: "Attendance", to: "/admin/attendance" },
    { label: "Leaves", to: "/admin/leaves" },
    { label: "Holidays", to: "/admin/holidays" },
  ];

  return (
    <div className="flex">
      <Sidebar links={links} />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employees/edit/:id" element={<EditEmployee />} />
            <Route path="attendance" element={<AttendanceReport />} />
            <Route path="leaves" element={<LeaveApproval />} />
            <Route path="holidays" element={<HolidayManagement />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
