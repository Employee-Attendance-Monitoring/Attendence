import { useEffect, useState, useMemo } from "react";
import {
  getAllLeaves,
  updateLeaveStatus,
} from "../../api/leaveApi";
import Loader from "../../components/Loader";

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Filters
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadLeaves = () => {
    setLoading(true);
    getAllLeaves()
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      loadLeaves();
    } catch (err) {
      console.error("Leave action failed:", err);
      alert(
        err.response?.data?.detail ||
          err.response?.data?.status ||
          "Action failed"
      );
    }
  };

  /* ==========================
     DERIVED FILTER DATA
  ========================== */

  const employeeOptions = [
    ...new Set(leaves.map((l) => l.employee_email).filter(Boolean)),
  ];

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const employeeMatch =
        employeeFilter === "ALL" ||
        leave.employee_email === employeeFilter;

      const statusMatch =
        statusFilter === "ALL" ||
        leave.status === statusFilter;

      return employeeMatch && statusMatch;
    });
  }, [leaves, employeeFilter, statusFilter]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Leave Approvals
      </h2>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* EMPLOYEE FILTER */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="ALL">All Employees</option>
              {employeeOptions.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS FILTER */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Employee (Email)</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {leave.employee_email}
                    </td>
                    <td className="px-4 py-2">
                      {leave.leave_type}
                    </td>
                    <td className="px-4 py-2">
                      {leave.start_date}
                    </td>
                    <td className="px-4 py-2">
                      {leave.end_date}
                    </td>
                    <td className="px-4 py-2">
                      {leave.reason || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              handleAction(leave.id, "APPROVED")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(leave.id, "REJECTED")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs text-white ${
                            leave.status === "APPROVED"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {leave.status}
                        </span>
                      )}
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

export default LeaveApproval;
