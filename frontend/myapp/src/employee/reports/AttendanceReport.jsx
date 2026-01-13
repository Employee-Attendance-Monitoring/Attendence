import { useEffect, useState } from "react";
import { getMyAttendanceReport } from "../../api/attendanceApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMyAttendanceReport(month)
      .then((res) => {
        setSummary(res.data.summary);
        setRecords(res.data.records);
      })
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Attendance Report
      </h2>

      {/* MONTH FILTER */}
      <div className="mb-4">
        <label className="font-medium mr-2">Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-1 rounded"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Present Days"
              value={summary.present_days}
              color="bg-green-600"
            />
            <SummaryCard
              title="Absent Days"
              value={summary.absent_days}
              color="bg-red-600"
            />
            <SummaryCard
              title="Paid Leaves"
              value={summary.paid_leaves}
              color="bg-yellow-500"
            />
            <SummaryCard
              title="Total Hours"
              value={summary.total_hours}
              color="bg-blue-600"
            />
          </div>

          {/* TABLE */}
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
                {records.map((row) => (
                  <tr key={row.date} className="border-t">
                    <td className="px-4 py-2">{row.date}</td>
                    <td className="px-4 py-2">
                      {row.sign_in || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {row.sign_out || "-"}
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

                {records.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, color }) => (
  <div className={`${color} text-white p-4 rounded shadow`}>
    <p className="text-sm">{title}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </div>
);

export default AttendanceReport;
