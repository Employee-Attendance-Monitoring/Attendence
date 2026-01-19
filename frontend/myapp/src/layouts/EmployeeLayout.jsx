import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const EmployeeLayout = () => {
  const links = [
    { label: "Dashboard", to: "/employee" },
    { label: "My Profile", to: "/employee/profile" },
    { label: "Attendance", to: "/employee/attendance" },
    { label: "Apply Leave", to: "/employee/leave" },
    { label: "Holidays", to: "/employee/holiday" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 flex-1 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
