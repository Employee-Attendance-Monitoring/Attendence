import { useEffect, useState } from "react";
import { getAdminAttendanceReport } from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAdminAttendanceReport({
        date,
        month,
        year,
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Attendance load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [date, month, year]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Attendance Report (Admin)
      </h2>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Month</label>
          <input
            type="number"
            min="1"
            max="12"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-1 rounded w-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            placeholder="2026"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border px-3 py-1 rounded w-28"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : records.length === 0 ? (
        <p className="text-center py-6">
          No attendance records found
        </p>
      ) : (
        records.map((emp) => (
          <div
            key={emp.employee_id}
            className="mb-6 bg-white shadow rounded"
          >
            <h3 className="px-4 py-2 font-semibold bg-gray-100">
              {emp.employee_name}
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-center">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Sign In</th>
                    <th className="px-4 py-2">Sign Out</th>
                    <th className="px-4 py-2">Hours</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emp.attendance.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 text-center text-gray-500"
                      >
                        No attendance records
                      </td>
                    </tr>
                  ) : (
                    emp.attendance.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-4 py-2">{row.date}</td>
                        <td className="px-4 py-2">
                          {row.sign_in || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {row.sign_out || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {row.working_hours}
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AttendanceReport;
