import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

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
      api.get("/attendance/my-history/"),
    ])
      .then(([summaryRes, historyRes]) => {
        setSummary(summaryRes.data);
        setRecords(historyRes.data || []);
      })
      .catch(() => alert("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [month]);

  /* ================= MONTH FILTER ================= */
  const monthlyRecords = useMemo(() => {
    return records.filter((r) => r.date.startsWith(month));
  }, [records, month]);

  if (loading || !summary) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
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

      {/* ================= SUMMARY ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 text-center">
          <SummaryCircle label="Present" value={summary.present} color="green" />
          <SummaryCircle label="Week Off" value={summary.week_off} color="pink" />
          <SummaryCircle label="Absent" value={summary.absent} color="red" />
          <SummaryCircle label="Paid Leave" value={summary.paid_leave} color="orange" />
          <SummaryCircle label="Late Mark" value={summary.late_mark} color="yellow" />
          <SummaryCircle label="Half Day" value={summary.half_day} color="blue" />
          <SummaryCircle label="OD Day" value={summary.od_day} color="gray" />
          <SummaryCircle label="Paid Day" value={summary.paid_day} color="purple" />
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
            {monthlyRecords.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No attendance records for this month
                </td>
              </tr>
            )}

            {monthlyRecords.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.date}</td>
                <td className="px-4 py-3">{formatTime(r.sign_in)}</td>
                <td className="px-4 py-3">
  {formatTime(r.sign_out)}

  {r.is_auto_signout && (
    <div className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
      🚩 Auto Sign-Out
    </div>
  )}
</td>
                <td className="px-4 py-3 text-center">{r.working_hours}</td>
                
  <td className="px-4 py-3 text-center">
  {/* Always show real status */}
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

const SummaryCircle = ({ label, value, color }) => {
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    gray: "text-gray-500",
    pink: "text-pink-500",
    purple: "text-purple-600",
  };

  return (
    <div>
      <div
        className={`mx-auto w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold ${colors[color]}`}
      >
        {value}
      </div>
      <p className="mt-2 text-xs text-gray-600">{label}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-yellow-100 text-yellow-700",
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
