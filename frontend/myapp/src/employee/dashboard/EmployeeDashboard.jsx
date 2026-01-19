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
  const [isWorking, setIsWorking] = useState(false);
  const [hasWorked, setHasWorked] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [stats] = useState({
    present: 18,
    absent: 2,
    leave: 3,
  });

  /* =====================
     DATE HELPER
     ===================== */
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  /* =====================
     RESUME TIMER ON LOAD
     ===================== */
  useEffect(() => {
    const storedDate = localStorage.getItem("workDate");
    const startTime = localStorage.getItem("workStartTime");
    const today = getTodayDate();

    if (storedDate === today && startTime) {
      const elapsed = Math.floor(
        (Date.now() - Number(startTime)) / 1000
      );
      setSeconds(elapsed);
      setHasWorked(true);
      setIsWorking(false);
    } else {
      // New day → reset
      localStorage.removeItem("workStartTime");
      localStorage.removeItem("workDate");
      setSeconds(0);
      setHasWorked(false);
      setIsWorking(false);
    }
  }, []);

  /* =====================
     RUN TIMER
     ===================== */
  useEffect(() => {
    let timer = null;

    if (isWorking) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWorking]);

  /* =====================
     FORMAT TIME
     ===================== */
  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  /* =====================
     BUTTON HANDLERS
     ===================== */
  const handleSignIn = () => {
    const today = getTodayDate();
    const storedDate = localStorage.getItem("workDate");

    // Reset only if new day
    if (storedDate !== today) {
      setSeconds(0);
    }

    localStorage.setItem("workDate", today);
    localStorage.setItem("workStartTime", Date.now());

    setIsWorking(true);
    setHasWorked(false);
  };

  const handleSignOut = () => {
    setIsWorking(false);
    setHasWorked(true);
  };

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
        <Card
          title="Today Status"
          value={
            isWorking
              ? "Working"
              : hasWorked
              ? "Completed"
              : "Not Started"
          }
        />
        <Card title="Working Hours" value={formatTime()} />
        <Card title="Leave Balance" value="10 Days" />
        <Card title="Holidays This Month" value="2" />
      </div>

      {/* TODAY ATTENDANCE */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Today Attendance</h3>

        <div className="flex justify-between items-center">
          <div>
            <p>
              <b>Sign In:</b>{" "}
              {isWorking || hasWorked ? "Done" : "Not signed in"}
            </p>
            <p>
              <b>Sign Out:</b>{" "}
              {hasWorked ? "Done" : "Not signed out"}
            </p>

            <p className="mt-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {isWorking
                  ? "Working"
                  : hasWorked
                  ? "Completed"
                  : "Not Started"}
              </span>
            </p>
          </div>

          {!isWorking ? (
            <button
              onClick={handleSignIn}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">
            Attendance Summary
          </h3>
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

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-4">
            Monthly Attendance
          </h3>
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
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded shadow">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </div>
);

export default EmployeeDashboard;
