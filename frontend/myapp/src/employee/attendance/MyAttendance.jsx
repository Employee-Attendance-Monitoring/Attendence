import { useEffect, useState } from "react";
import {
  employeeSignIn,
  employeeSignOut,
  getMyAttendance,
} from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAttendance = () => {
    setLoading(true);
    getMyAttendance()
      .then((res) => {
        setAttendance(res.data.history);
        setTodayRecord(res.data.today);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSignIn = async () => {
    await employeeSignIn();
    loadAttendance();
  };

  const handleSignOut = async () => {
    await employeeSignOut();
    loadAttendance();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Attendance</h2>

      {/* TODAY ACTION */}
      <div className="bg-white p-5 shadow rounded mb-6">
        <h3 className="font-semibold mb-2">
          Today: {new Date().toDateString()}
        </h3>

        <div className="flex gap-4">
          <button
            onClick={handleSignIn}
            disabled={todayRecord?.sign_in}
            className={`px-5 py-2 rounded text-white ${
              todayRecord?.sign_in
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={handleSignOut}
            disabled={!todayRecord?.sign_in || todayRecord?.sign_out}
            className={`px-5 py-2 rounded text-white ${
              todayRecord?.sign_out
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600"
            }`}
          >
            Sign Out
          </button>
        </div>

        {todayRecord && (
          <div className="mt-3 text-sm text-gray-700">
            <p>
              Sign In:{" "}
              {todayRecord.sign_in
                ? new Date(todayRecord.sign_in).toLocaleTimeString()
                : "-"}
            </p>
            <p>
              Sign Out:{" "}
              {todayRecord.sign_out
                ? new Date(todayRecord.sign_out).toLocaleTimeString()
                : "-"}
            </p>
            <p>Working Hours: {todayRecord.working_hours}</p>
          </div>
        )}
      </div>

      {/* HISTORY */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Sign In</th>
                <th className="px-4 py-2">Sign Out</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((row) => (
                <tr key={row.date} className="border-t">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">
                    {row.sign_in
                      ? new Date(row.sign_in).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {row.sign_out
                      ? new Date(row.sign_out).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {row.working_hours}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        row.status === "PRESENT"
                          ? "bg-green-600"
                          : row.status === "HALF_DAY"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {attendance.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
