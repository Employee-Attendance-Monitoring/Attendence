import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f97316"];

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    present: 18,
    absent: 2,
    leave: 3,
  });

  const attendanceData = [
    { name: "Present", value: stats.present },
    { name: "Absent", value: stats.absent },
    { name: "Leave", value: stats.leave },
  ];

  const monthlyData = [
    { month: "Jan", days: 20 },
    { month: "Feb", days: 18 },
    { month: "Mar", days: 22 },
    { month: "Apr", days: 19 },
  ];

  return (
    <div className="space-y-6">
      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Today Status" value="Absent" />
        <Card title="Working Hours" value="0 hrs" />
        <Card title="Leave Balance" value="10 Days" />
        <Card title="Holidays This Month" value="2" />
      </div>

      {/* TODAY ATTENDANCE */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Today Attendance</h3>
        <div className="flex justify-between items-center">
          <div>
            <p><b>Sign In:</b> Not signed in</p>
            <p><b>Sign Out:</b> Not signed out</p>
            <p className="mt-2">
              <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                Absent
              </span>
            </p>
          </div>

          <button className="bg-green-600 text-white px-6 py-2 rounded">
            Sign In
          </button>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIE */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">Attendance Summary</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
              >
                {attendanceData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">Monthly Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="days" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickCard title="My Profile" desc="View personal details" />
        <QuickCard title="My Attendance" desc="Attendance history" />
        <QuickCard title="Apply Leave" desc="Request leave" />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded shadow">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </div>
);

const QuickCard = ({ title, desc }) => (
  <div className="bg-white p-6 rounded shadow hover:shadow-md cursor-pointer">
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

export default EmployeeDashboard;
