import { useEffect, useState } from "react";
import { getAdminAttendanceReport } from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const [date, setDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAdminAttendanceReport({ date });
      setRecords(res.data);
    } catch (err) {
      console.error("Attendance load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Attendance Report (Admin)
      </h2>

      {/* DATE FILTER */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Sign In</th>
                <th className="px-4 py-2">Sign Out</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center">
                    No attendance records found
                  </td>
                </tr>
              )}

              {records.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-2">
                    {row.employee_email}
                  </td>
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.sign_in || "-"}</td>
                  <td className="px-4 py-2">{row.sign_out || "-"}</td>
                  <td className="px-4 py-2">{row.working_hours}</td>
                  <td className="px-4 py-2">
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
