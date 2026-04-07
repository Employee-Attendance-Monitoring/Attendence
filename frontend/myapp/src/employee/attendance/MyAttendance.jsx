import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  // 📅 Monthly filter
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get(`/attendance/my-dashboard-summary/?month=${month}`),
      api.get(`/attendance/my-history/?month=${month}`),
    ])
      .then(([summaryRes, historyRes]) => {
        setSummary(summaryRes.data || {});
        setRecords(historyRes.data || []);
      })
      .catch(() => alert("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [month]);

  /* ================= MONTH FILTER ================= */
  const monthlyRecords = useMemo(() => {
    return records.filter((r) => {
      if (!r.date) return false;
      return r.date.startsWith(month);
    });
  }, [records, month]);

  /* ================= SORT ================= */
  const sortedRecords = useMemo(() => {
    return [...monthlyRecords].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [monthlyRecords]);

  if (loading || !summary) return <Loader />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance Dashboard</h2>
          <p className="text-sm text-gray-500">
            Monthly attendance overview & history
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* ================= CIRCLE CHART (LIKE YOUR IMAGE) ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 text-center">

          <SummaryCircle label="Present" value={summary.present ?? 0} color="green" total={summary.working_days || 30} />

          <SummaryCircle label="Week Off" value={summary.week_off ?? 0} color="pink" total={30} />

          <SummaryCircle label="Absent" value={summary.absent ?? 0} color="blue" total={summary.working_days || 30} />

          <SummaryCircle label="Paid Leave" value={summary.paid_leave ?? 0} color="orange" total={summary.working_days || 30} />

          <SummaryCircle label="Late Mark" value={summary.late_mark ?? 0} color="pink" total={summary.working_days || 30}/>

          <SummaryCircle label="Half Day" value={summary.half_day ?? 0} color="gray" total={summary.working_days || 30} />
          <SummaryCircle label="Paid Day" value={summary.paid_day ?? 0} color="purple" total={summary.working_days || 30} />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded-xl overflow-x-auto border">
        <h3 className="font-semibold p-4 border-b">
          Attendance History
        </h3>

        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Sign In</th>
              <th className="px-4 py-3 text-left">Sign Out</th>
              <th className="px-4 py-3 text-center">Hours</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedRecords.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No attendance records for this month
                </td>
              </tr>
            )}

            {sortedRecords.map((r, index) => (
              <tr
                key={r.id || index}
                className={`border-t hover:bg-gray-50 ${
                  r.status === "ABSENT" ? "bg-red-50" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {formatDateDMY(r.date)}
                </td>

                <td className="px-4 py-3">
                  {formatTime(r.sign_in)}
                </td>

                <td className="px-4 py-3">
                  {formatTime(r.sign_out)}

                  {r.is_auto_signout && (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      🚩 Auto Sign-Out
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  {r.working_hours || "0h 0m"}
                </td>

                <td className="px-4 py-3 text-center">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value.replace(" ", "T"));
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* 🔥 UPDATED CIRCLE (MAIN FIX) */
const SummaryCircle = ({ label, value, color, total = 30 }) => {
  const colors = {
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
    orange: "#f97316",
    yellow: "#eab308",
    gray: "#9ca3af",
    pink: "#ec4899",
    purple: "#8b5cf6",
  };

  const radius = 28;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = value / total;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke={colors[color]}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-sm font-bold fill-gray-700"
        >
          {value}
        </text>
      </svg>

      <p className="mt-2 text-xs text-gray-600">{label}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-yellow-100 text-yellow-700",
    WEEK_OFF: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default MyAttendance;