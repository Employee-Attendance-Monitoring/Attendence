import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/attendance/my-history/")
      .then((res) => setRecords(res.data))
      .catch(() => alert("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attendance History</h2>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Sign In</th>
            <th className="p-3">Sign Out</th>
            <th className="p-3">Hours</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No attendance records
              </td>
            </tr>
          )}

          {records.map((r) => (
            <tr key={r.id} className="border-t text-center">
              <td className="p-3">{r.date}</td>
              <td className="p-3">{formatTime12Hr(r.sign_in)}</td>
              <td className="p-3">{formatTime12Hr(r.sign_out)}</td>

              <td className="p-3">{r.working_hours}</td>
              <td className="p-3">
                <span className="px-3 py-1 rounded bg-gray-100">
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyAttendance;
