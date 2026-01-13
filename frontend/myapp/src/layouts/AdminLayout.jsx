import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const links = [
    { label: "Dashboard", to: "/admin" },
    { label: "Employees", to: "/admin/employees" },
    { label: "Attendance", to: "/admin/attendance" },
    { label: "Leaves", to: "/admin/leaves" },
    { label: "Holidays", to: "/admin/holidays" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={links} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 flex-1 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
