import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const links = [
    { label: "Dashboard", to: "/admin" },
    { label: "Employees", to: "/admin/employees" },
    { label: "Attendance", to: "/admin/attendance" },
    { label: "Holidays", to: "/admin/holidays" },

  //Organization
 { label: "Organization", to: "/admin/organization" },
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

export default AdminLayout;
