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

  const totalEmployees = stats.total_employees ?? 0;

  const presentToday = stats.present_today ?? 0;
  const absentToday = stats.absent_today ?? 0;

  const onLeaveToday = stats.on_leave_today ?? 0;
  const pendingLeaveRequests = stats.pending_leave_requests ?? 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  /* 🎂 Birthdays */
  const birthdaysThisMonth = employees.filter(
    (e) =>
      e.date_of_birth &&
      new Date(e.date_of_birth).getMonth() === currentMonth
  );

  /* 🏆 Work Anniversaries */
  const anniversariesThisMonth = employees.filter((e) => {
    if (!e.date_of_joining) return false;
    const doj = new Date(e.date_of_joining);
    return (
      doj.getMonth() === currentMonth &&
      doj.getFullYear() < currentYear
    );
  });

  /* 🎉 New Joiners */
  const newJoiners = employees.filter((e) => {
    const doj = new Date(e.date_of_joining);
    return (
      doj.getMonth() === currentMonth &&
      doj.getFullYear() === currentYear
    );
  });

  return (
    <div className="p-6 space-y-8">
       
      {/* ================= HEADERr ================= */}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 🎂 Birthdays */}
        <Card
          icon="🎂"
          title="Birthdays This Month"
          emptyText="No birthdays this month"
          items={birthdaysThisMonth.map((emp) => ({
            key: emp.id,
            avatarBg: "bg-pink-100 text-pink-600",
            name: emp.full_name,
            subtitle: emp.date_of_birth,
            badge: emp.date_of_birth,
            badgeStyle: "bg-pink-50 text-pink-600",
          }))}
        />

        {/* 🏆 Anniversaries */}
        <Card
          icon="🏆"
          title="Work Anniversaries This Month"
          emptyText="No work anniversaries this month"
          items={anniversariesThisMonth.map((emp) => {
            const years =
              currentYear -
              new Date(emp.date_of_joining).getFullYear();

            return {
              key: emp.id,
              avatarBg: "bg-yellow-100 text-yellow-600",
              name: emp.full_name,
              subtitle: `${years} year${years > 1 ? "s" : ""}`,
              badge: emp.date_of_joining,
              badgeStyle: "bg-yellow-50 text-yellow-600",
            };
          })}
        />

        {/* 🎉 New Joiners */}
        <Card
          icon="🎉"
          title="Welcome to the Team"
          emptyText="No new joiners this month"
          items={newJoiners.map((emp) => ({
            key: emp.id,
            avatarBg:
              "bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
            name: emp.full_name,
            subtitle: `Joined on ${emp.date_of_joining}`,
            badge: "New",
            badgeStyle: "bg-indigo-50 text-indigo-600",
          }))}
        />
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, gradient }) => (
  <div
    className={`bg-gradient-to-br ${gradient} text-white rounded-xl p-5 shadow-lg`}
  >
    <p className="text-sm opacity-90">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const Card = ({ icon, title, items, emptyText }) => (
  <div className="bg-white rounded-xl shadow border">
    <div className="px-6 py-4 border-b flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>
    </div>

    <div className="p-6 space-y-4">
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyText}</p>
      ) : (
        items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${item.avatarBg}`}
              >
                {item.name.charAt(0)}
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full ${item.badgeStyle}`}
            >
              {item.badge}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AdminDashboard;
