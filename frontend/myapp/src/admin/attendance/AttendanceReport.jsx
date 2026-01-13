import { useEffect, useState } from "react";
import { getAdminAttendanceReport } from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAdminAttendanceReport(date)
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>

      {/* Date Filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Date:</label>
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
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Emp Code</th>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2">Sign In</th>
                <th className="px-4 py-2">Sign Out</th>
                <th className="px-4 py-2">Hours</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    No records found
                  </td>
                </tr>
              )}

              {records.map((row) => (
                <tr key={row.employee_id} className="border-t">
                  <td className="px-4 py-2">{row.emp_code}</td>
                  <td className="px-4 py-2">{row.employee_name}</td>
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
