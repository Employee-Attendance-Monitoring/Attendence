import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import EmployeeDashboard from "../employee/dashboard/EmployeeDashboard";
import MyProfile from "../employee/profile/MyProfile";
import MyAttendance from "../employee/attendance/MyAttendance";
import ApplyLeave from "../employee/leave/ApplyLeave";
import AttendanceReport from "../employee/reports/AttendanceReport";

const EmployeeLayout = () => {
  const links = [
    { label: "Dashboard", to: "/employee" },
    { label: "My Profile", to: "/employee/profile" },
    { label: "Attendance", to: "/employee/attendance" },
    { label: "Apply Leave", to: "/employee/leave" },
    { label: "Reports", to: "/employee/reports" },
  ];

  return (
    <div className="flex">
      <Sidebar links={links} />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <Routes>
            <Route index element={<EmployeeDashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leave" element={<ApplyLeave />} />
            <Route path="reports" element={<AttendanceReport />} />
            <Route path="*" element={<Navigate to="/employee" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
