import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://127.0.0.1:8000";

/* ===========================
   PROFILE COMPLETION CHECK
=========================== */
const isProfileComplete = (emp) => {
  return Boolean(
    emp.phone_number &&
    emp.photo &&
    emp.pancard_number &&
    emp.aadhaar_number &&
    emp.bank_detail &&
    emp.bank_detail.bank_name &&
    emp.bank_detail.account_number &&
    emp.bank_detail.ifsc_code
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
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

  /* ===========================
     DERIVED STATS
  =========================== */
  const departments = [
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ];

  const completedProfiles = employees.filter(isProfileComplete).length;

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const newJoins = employees.filter(
    (e) => new Date(e.date_of_joining) >= last30Days
  ).length;

  return (
    <div>
      {/* ===== HEADER ===== */}
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        <StatCard title="Total Employees" value={stats.total_employees} />
        <StatCard title="Departments" value={departments.length} />
        <StatCard title="New Joins (30 days)" value={newJoins} />
        <StatCard
          title="Profiles Completed"
          value={`${completedProfiles} / ${employees.length}`}
        />
      </div>

      {/* ===== EMPLOYEE LIST ===== */}
      <h2 className="text-xl font-bold mb-4">
        Employee Details
      </h2>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employees.map((emp) => {
            const isComplete = isProfileComplete(emp);

            return (
              <div
                key={emp.id}
                className="bg-white rounded-lg shadow border hover:shadow-lg transition"
              >
                {/* CARD HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <div className="flex items-center gap-3">
                    {emp.photo ? (
                      <img
                        src={
                          emp.photo.startsWith("http")
                            ? emp.photo
                            : `${BACKEND_URL}${emp.photo}`
                        }
                        alt={emp.full_name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                        {emp.full_name?.[0]}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {emp.full_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {emp.employee_code}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {isComplete
                      ? "Profile Complete"
                      : "Profile Incomplete"}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
                  <InfoRow label="Email" value={emp.email_display} />
                  <InfoRow label="Department" value={emp.department} />
                  <InfoRow label="Company" value={emp.company_name} />
                  <InfoRow
                    label="Date of Joining"
                    value={emp.date_of_joining}
                  />

                  {/* OPTIONAL: SHOW WHY INCOMPLETE */}
                  {!isComplete && (
                    <p className="text-xs text-red-500 pt-2">
                      Profile missing details
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ===========================
   REUSABLE COMPONENTS
=========================== */

const StatCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-lg shadow border">
    <p className="text-sm text-gray-500 mb-1">
      {title}
    </p>
    <h2 className="text-3xl font-bold text-gray-800">
      {value}
    </h2>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <span className="font-medium text-gray-500">
      {label}:
    </span>{" "}
    {value || "-"}
  </div>
);

export default AdminDashboard;
