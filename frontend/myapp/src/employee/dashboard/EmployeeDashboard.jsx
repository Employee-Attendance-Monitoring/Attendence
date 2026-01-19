import { useEffect, useState } from "react";
import {
  employeeSignIn,
  employeeSignOut,
  getMyAttendanceHistory,
} from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const EmployeeDashboard = () => {
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [seconds, setSeconds] = useState(0);

  /* ================= LOAD ATTENDANCE ================= */
  const loadAttendance = async () => {
    setLoading(true);
    const res = await getMyAttendanceHistory();
    setRecords(res.data);

    const todayDate = new Date().toISOString().slice(0, 10);
    const todayRecord = res.data.find(r => r.date === todayDate);
    setToday(todayRecord || null);

    if (todayRecord?.sign_in && !todayRecord.sign_out) {
      const diff =
        (Date.now() - new Date(todayRecord.sign_in)) / 1000;
      setSeconds(Math.floor(diff));
      setWorking(true);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    let timer;
    if (working) {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [working]);

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
      alert(err.response?.data?.detail);
    }
  };

  const handleSignOut = async () => {
    await employeeSignOut();
    setWorking(false);
    loadAttendance();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* TODAY STATUS */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-semibold mb-4">Today Attendance</h3>

        <p><b>Sign In:</b> {today?.sign_in || "-"}</p>
        <p><b>Sign Out:</b> {today?.sign_out || "-"}</p>
        <p className="mt-2"><b>Working Time:</b> {formatTime()}</p>

        <div className="mt-4">
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

      {/* HISTORY */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th>Date</th>
              <th>Sign In</th>
              <th>Sign Out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-t">
                <td>{r.date}</td>
                <td>{r.sign_in || "-"}</td>
                <td>{r.sign_out || "-"}</td>
                <td>{r.working_hours}</td>
                <td>{r.status}</td>
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
