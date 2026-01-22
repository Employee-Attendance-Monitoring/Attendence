import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [status, setStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    api
      .get("/attendance/my-history/")
      .then((res) => setRecords(res.data || []))
      .catch(() => alert("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, []);

  const formatTime12Hr = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime.replace(" ", "T"));
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  /* ================= FILTER LOGIC ================= */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const recordDate = new Date(r.date);

      if (status !== "ALL" && r.status !== status) return false;
      if (fromDate && recordDate < new Date(fromDate)) return false;
      if (toDate && recordDate > new Date(toDate)) return false;

      return true;
    });
  }, [records, status, fromDate, toDate]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-2xl font-bold">Attendance History</h2>
        <p className="text-sm text-gray-500">
          View and filter your attendance 
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded-xl shadow border grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-500">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ALL">All</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatus("ALL");
              setFromDate("");
              setToDate("");
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded-xl overflow-x-auto border">
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
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}

            {filteredRecords.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">{r.date}</td>
                <td className="px-4 py-3">
                  {formatTime12Hr(r.sign_in)}
                </td>
                <td className="px-4 py-3">
                  {formatTime12Hr(r.sign_out)}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.working_hours}
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

/* ================= STATUS BADGE ================= */
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
