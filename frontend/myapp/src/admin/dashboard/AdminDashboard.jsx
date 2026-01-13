import { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../../api/attendanceApi";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdminDashboardStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    {
      title: "Total Employees",
      value: stats.total_employees,
      action: () => navigate("/admin/employees")
    },
    {
      title: "Present Today",
      value: stats.present_today,
      action: () => navigate("/admin/attendance")
    },
    {
      title: "Absent Today",
      value: stats.absent_today,
      action: () => navigate("/admin/attendance")
    },
    {
      title: "Pending Leaves",
      value: stats.pending_leaves,
      action: () => navigate("/admin/leaves")
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={card.action}
            className="bg-white shadow rounded p-5 cursor-pointer hover:bg-blue-50"
          >
            <p className="text-gray-600">{card.title}</p>
            <h3 className="text-3xl font-bold">{card.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
