import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAttendanceReport } from "../../api/attendanceApi";
import { getEmployeeDropdown } from "../../api/employeeApi";
import { getLeaveSummary } from "../../api/leaveApi";
import Loader from "../../components/Loader";

const AttendanceReport = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("DAILY"); // DAILY | MONTHLY
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [employee, setEmployee] = useState("all");

  /* ✅ NEW */
  const [department, setDepartment] = useState("all");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]); // ✅ NEW

  const [records, setRecords] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD EMPLOYEES ================= */
  useEffect(() => {
    getEmployeeDropdown().then((res) => {
      const data = res.data || [];
      setEmployees(data);

      // ✅ extract unique departments
      const uniqueDepartments = [
        ...new Set(data.map((e) => e.department).filter(Boolean)),
      ];
      setDepartments(uniqueDepartments);
    });
  }, []);

  /* ================= LOAD ATTENDANCE ================= */
  useEffect(() => {
    loadAttendance();
  }, [date, month, employee, viewMode]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAdminAttendanceReport(
        viewMode === "DAILY" ? date : "",
        employee
      );
      setRecords(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD LEAVE SUMMARY ================= */
  useEffect(() => {
    if (employee !== "all") {
      getLeaveSummary(employee)
        .then((res) => setLeaveSummary(res.data))
        .catch(() => setLeaveSummary(null));
    } else {
      setLeaveSummary(null);
    }
  }, [employee]);

  /* ================= FILTER ================= */
  const filteredRecords = useMemo(() => {
    let data = [...records];

    if (department !== "all") {
      data = data.filter(
        (r) => r.department === department
      );
    }

    if (viewMode === "MONTHLY" && month) {
      data = data.filter((r) => r.date.startsWith(month));
    }

    if (viewMode === "DAILY" && date) {
      data = data.filter((r) => r.date === date);
    }

    return data;
  }, [records, date, month, viewMode, department]);

  /* ================= MONTH SUMMARY ================= */
  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let half = 0;
    let hours = 0;

    filteredRecords.forEach((r) => {
      if (r.status === "PRESENT") present++;
      else if (r.status === "ABSENT") absent++;
      else if (r.status === "HALF_DAY") half++;
      hours += Number(r.working_hours || 0);
    });

    return { present, absent, half, hours };
  }, [filteredRecords]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Attendance Report (Admin)
      </h2>

      {/* ================= VIEW MODE BUTTONS ================= */}
      <div className="flex gap-3">
        <button
          onClick={() => setViewMode("DAILY")}
          className={`px-4 py-2 rounded ${
            viewMode === "DAILY"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Daily View
        </button>

        <button
          onClick={() => setViewMode("MONTHLY")}
          className={`px-4 py-2 rounded ${
            viewMode === "MONTHLY"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Monthly View
        </button>

        <button
          onClick={() => navigate("/admin/leave-balance")}
          className="px-4 py-2 rounded bg-purple-600 text-white"
        >
          Leave Balance
        </button>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        {viewMode === "DAILY" && (
          <div>
            <label className="text-sm">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}

        {viewMode === "MONTHLY" && (
          <div>
            <label className="text-sm">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}

        {/* ✅ DEPARTMENT FILTER */}
        <div>
          <label className="text-sm">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* EMPLOYEE FILTER */}
        <div>
          <label className="text-sm">Employee</label>
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="all">All Employees</option>
            {employees.map((e) => (
              <option key={e.email} value={e.email}>
                {e.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= LEAVE BALANCE CARDS ================= */}
      {leaveSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeaveCard title="Total Leave" value={leaveSummary.total} />
          <LeaveCard title="Leave Taken" value={leaveSummary.taken} />
          <LeaveCard title="Leave Balance" value={leaveSummary.balance} />
        </div>
      )}

      {/* ================= MONTH SUMMARY ================= */}
      {viewMode === "MONTHLY" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Summary title="Present Days" value={summary.present} />
          <Summary title="Absent Days" value={summary.absent} />
          <Summary title="Half Days" value={summary.half} />
          <Summary
            title="Total Hours"
            value={`${summary.hours.toFixed(2)} hrs`}
          />
        </div>
      )}

      {/* ================= TABLE ================= */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Date</th>
                <th className="p-3">Sign In</th>
                <th className="p-3">Sign Out</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.employee_email}</td>
                    <td className="p-3">{r.date}</td>
                    <td className="p-3">{r.sign_in || "-"}</td>
                    <td className="p-3">{r.sign_out || "-"}</td>
                    <td className="p-3">{r.working_hours}</td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
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

/* ================= REUSABLE ================= */

const Summary = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const LeaveCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[status]}`}>
      {status}
    </span>
  );
};

export default AttendanceReport;
