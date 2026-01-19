import { useEffect, useState } from "react";
import {
  employeeSignIn,
  employeeSignOut,
  getMyAttendanceHistory,
} from "../../api/attendanceApi";
import Loader from "../../components/Loader";
import { useLocation } from "react-router-dom";

const EmployeeDashboard = () => {
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const location = useLocation();

  /* ================= LOAD ATTENDANCE ================= */
  const loadAttendance = async () => {
    try {
      setLoading(true);

      const res = await getMyAttendanceHistory();
      const data = res.data || [];
      setRecords(data);

      const todayDate = new Date().toISOString().slice(0, 10);
      const todayRecord =
        data.find((r) => r.date === todayDate) || null;

      setToday(todayRecord);

      // ⏱ TIMER LOGIC
      if (todayRecord?.sign_in && !todayRecord?.sign_out) {
        // still working
        const diff =
          (Date.now() - new Date(todayRecord.sign_in)) / 1000;
        setSeconds(Math.floor(diff));
        setWorking(true);
      } else if (
        todayRecord?.sign_in &&
        todayRecord?.sign_out
      ) {
        // signed out
        const diff =
          (new Date(todayRecord.sign_out) -
            new Date(todayRecord.sign_in)) /
          1000;
        setSeconds(Math.floor(diff));
        setWorking(false);
      } else {
        // no attendance today
        setSeconds(0);
        setWorking(false);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= RELOAD ON ROUTE CHANGE ================= */
  useEffect(() => {
    loadAttendance();
  }, [location.pathname]);

  /* ================= TIMER ================= */
  useEffect(() => {
    let timer = null;

    if (working) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [working]);

  /* ================= HELPERS ================= */
  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  /* ================= ACTIONS ================= */
  const handleSignIn = async () => {
    try {
      await employeeSignIn();
      loadAttendance();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  const handleSignOut = async () => {
    try {
      await employeeSignOut();
      setWorking(false);
      loadAttendance();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* ================= TODAY ================= */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">
          Today Attendance
        </h3>

        <div className="space-y-1">
          <p>
            <b>Sign In:</b> {today?.sign_in || "-"}
          </p>
          <p>
            <b>Sign Out:</b> {today?.sign_out || "-"}
          </p>
          <p className="font-medium mt-2">
            Working Time: {formatTime()}
          </p>
        </div>

        <div className="mt-5 flex gap-4">
          {!today?.sign_in && (
            <button
              onClick={handleSignIn}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Sign In
            </button>
          )}

          {today?.sign_in && !today?.sign_out && (
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sign In</th>
              <th className="px-4 py-3">Sign Out</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  {r.sign_in || "-"}
                </td>
                <td className="px-4 py-3">
                  {r.sign_out || "-"}
                </td>
                <td className="px-4 py-3">
                  {r.working_hours}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      r.status === "PRESENT"
                        ? "bg-green-600"
                        : r.status === "HALF_DAY"
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6">
                  No attendance records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
