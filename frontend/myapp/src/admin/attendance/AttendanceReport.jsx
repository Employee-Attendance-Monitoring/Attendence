import { useEffect, useState } from "react";
import { getAdminAttendanceReport } from "../../api/attendanceApi";
import { getEmployeeDropdown } from "../../api/employeeApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const [date, setDate] = useState("");
  const [employee, setEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  /* LOAD EMPLOYEE DROPDOWN */
  useEffect(() => {
    getEmployeeDropdown().then(res => {
      setEmployees(res.data);
    });
  }, []);

  /* LOAD ATTENDANCE */
  useEffect(() => {
    loadAttendance();
  }, [date, employee]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAdminAttendanceReport(date, employee);
      setRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Attendance Report (Admin)
      </h2>

      {/* FILTERS */}
      <div className="flex gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Employee</label>
          <select
  value={employee}
  onChange={(e) => setEmployee(e.target.value)}
  className="border px-3 py-2 rounded"
>
  <option value="all">All Employees</option>

  {employees.map((emp) => (
    <option key={emp.email} value={emp.email}>
      {emp.email}
    </option>
  ))}
</select>

        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Sign In</th>
                <th className="px-4 py-3">Sign Out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-2">
                      {row.employee_email}
                    </td>
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
      )}
    </div>
  );
};

export default AttendanceReport;
