import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, empRes] = await Promise.all([
          api.get("/accounts/admin-dashboard/"),
          api.get("/employees/list/"),
        ]);

        setStats(statsRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!stats) return <p className="text-center mt-10">No dashboard data</p>;

  /* =========================
     DERIVED DATA
  ========================= */

  const totalEmployees = employees.length;

  const presentToday = stats.present_today ?? 3;
  const absentToday = stats.absent_today ?? totalEmployees - presentToday;
  const onLeaveToday = stats.on_leave_today ?? 1;
  const pendingLeaveRequests = stats.pending_leave_requests ?? 2;

  const currentMonth = new Date().getMonth();

  const birthdaysThisMonth = employees.filter(
    (e) =>
      e.date_of_birth &&
      new Date(e.date_of_birth).getMonth() === currentMonth
  );

  const newJoiners = employees.filter((e) => {
    const doj = new Date(e.date_of_joining);
    const now = new Date();
    return (
      doj.getMonth() === now.getMonth() &&
      doj.getFullYear() === now.getFullYear()
    );
  });

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overview of today’s workforce status
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Present Today"
          value={`${presentToday} / ${totalEmployees}`}
          gradient="from-green-400 to-emerald-600"
        />
        <StatCard
          title="Absent Today"
          value={`${absentToday} / ${totalEmployees}`}
          gradient="from-red-400 to-rose-600"
        />
        <StatCard
          title="On Leave"
          value={onLeaveToday}
          gradient="from-orange-400 to-amber-500"
        />
        <StatCard
          title="Pending Requests"
          value={pendingLeaveRequests}
          gradient="from-blue-400 to-indigo-600"
        />
      </div>

      {/* ================= BOTTOM CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🎂 Birthdays */}
        <div className="bg-white rounded-xl shadow border">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <span className="text-xl">🎂</span>
            <h3 className="text-lg font-semibold text-gray-800">
              Birthdays This Month
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {birthdaysThisMonth.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No birthdays this month
              </p>
            ) : (
              birthdaysThisMonth.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 
                                    flex items-center justify-center font-semibold">
                      {emp.full_name.charAt(0)}
                    </div>

                    <span className="font-medium text-gray-700">
                      {emp.full_name}
                    </span>
                  </div>

                  <span className="text-xs bg-pink-50 text-pink-600 
                                   px-3 py-1 rounded-full">
                    {emp.date_of_birth}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🎉 New Joiners */}
        <div className="bg-white rounded-xl shadow border">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <h3 className="text-lg font-semibold text-gray-800">
              Welcome to the Team
            </h3>
          </div>

          <div className="p-6 space-y-4">
            {newJoiners.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No new joiners this month
              </p>
            ) : (
              newJoiners.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full 
                                    bg-gradient-to-br from-blue-400 to-indigo-500 
                                    text-white flex items-center justify-center font-semibold">
                      {emp.full_name.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium text-gray-700">
                        {emp.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined on {emp.date_of_joining}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs bg-indigo-50 text-indigo-600 
                                   px-3 py-1 rounded-full">
                    New
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ================= COMPONENT ================= */

const StatCard = ({ title, value, gradient }) => (
  <div
    className={`bg-gradient-to-br ${gradient} text-white rounded-xl p-5 shadow-lg`}
  >
    <p className="text-sm opacity-90">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default AdminDashboard;
