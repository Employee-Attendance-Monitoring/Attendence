import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, empRes] = await Promise.all([
          api.get("/accounts/admin-dashboard/"),
          api.get("/employees/list/"),
        ]);

        setStats(statsRes.data);
        setEmployees(empRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>No dashboard data</p>;

  return (
    <div>
      {/* ===== SUMMARY CARDS ===== */}
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Total Employees</p>
          <h2 className="text-3xl font-bold">
            {stats.total_employees}
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Active Employees</p>
          <h2 className="text-3xl font-bold">
            {stats.active_employees}
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Present Today</p>
          <h2 className="text-3xl font-bold">
            {stats.present_today}
          </h2>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">On Leave</p>
          <h2 className="text-3xl font-bold">
            {stats.on_leave}
          </h2>
        </div>
      </div>

      {/* ===== EMPLOYEE DETAILS SECTION ===== */}
      <h2 className="text-xl font-bold mb-4">
        Employee Details
      </h2>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <div
  key={emp.id}
  className="bg-white rounded-lg shadow border hover:shadow-lg transition"
>
  {/* Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b">
    <h3 className="text-lg font-semibold text-gray-800">
      {emp.full_name}
    </h3>

    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
      Active
    </span>
  </div>

  {/* Body */}
  <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
    <div>
      <span className="font-medium text-gray-500">
        Email:
      </span>{" "}
      {emp.email_display}
    </div>

    <div>
      <span className="font-medium text-gray-500">
        Department:
      </span>{" "}
      {emp.department}
    </div>

    <div>
      <span className="font-medium text-gray-500">
        Company:
      </span>{" "}
      {emp.company_name}
    </div>

    <div>
      <span className="font-medium text-gray-500">
        Date of Joining:
      </span>{" "}
      {emp.date_of_joining}
    </div>
  </div>

  {/* Footer */}
  {/* <div className="px-5 py-3 bg-gray-50 text-sm flex justify-between items-center">
    <span className="text-blue-600">
      Attendance: Coming soon
    </span>

    <button
      className="text-sm text-blue-600 hover:underline"
      onClick={() =>
        alert("Employee profile page coming soon")
      }
    >
      View Profile →
    </button>
  </div> */}
</div>

          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
