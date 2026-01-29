import { useEffect, useState, useMemo } from "react";
import {
  getAllLeaves,
  updateLeaveStatus,
  getAdminLeaveTypes,
  addLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../../api/leaveApi";
import Loader from "../../components/Loader";

const LeaveApproval = () => {
  /* ================= STATE ================= */
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveType, setNewLeaveType] = useState("");
  const [loading, setLoading] = useState(false);

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ================= LOAD DATA ================= */
  const loadLeaves = () => {
    setLoading(true);
    getAllLeaves()
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  const loadLeaveTypes = () => {
    getAdminLeaveTypes().then((res) => setLeaveTypes(res.data));
  };

  useEffect(() => {
    loadLeaves();
    loadLeaveTypes();
  }, []);

  /* ================= ACTIONS ================= */
  const handleAction = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      loadLeaves();
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleAddLeaveType = async () => {
    if (!newLeaveType.trim()) return;

    await addLeaveType({ name: newLeaveType });
    setNewLeaveType("");
    loadLeaveTypes();
  };

  const handleToggleLeaveType = async (lt) => {
    await updateLeaveType(lt.id, { is_active: !lt.is_active });
    loadLeaveTypes();
  };

  const handleDeleteLeaveType = async (id) => {
    if (!window.confirm("Delete leave type?")) return;
    await deleteLeaveType(id);
    loadLeaveTypes();
  };

  /* ================= FILTERING ================= */
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

  /* ================= UI ================= */
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Leave Approvals</h2>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* ================= APPROVAL TABLE ================= */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto mb-10">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-gray-500">
                    No leave requests
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="border-t">
                    <td>{leave.employee_email}</td>
                    <td className="font-medium">
                      {leave.leave_type_name}
                    </td>
                    <td>{leave.start_date}</td>
                    <td>{leave.end_date}</td>
                    <td>{leave.reason || "-"}</td>
                    <td>
                      {leave.status === "PENDING" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              handleAction(leave.id, "APPROVED")
                            }
                            className="btn-success"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(leave.id, "REJECTED")
                            }
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="badge">{leave.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= LEAVE TYPE MANAGEMENT ================= */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">
          Manage Leave Types
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="New leave type"
            value={newLeaveType}
            onChange={(e) => setNewLeaveType(e.target.value)}
          />
          <button
            onClick={handleAddLeaveType}
            className="btn-primary"
          >
            Add
          </button>
        </div>

        <ul className="divide-y">
          {leaveTypes.map((lt) => (
            <li
              key={lt.id}
              className="flex justify-between items-center py-2"
            >
              <span>
                {lt.name}{" "}
                {!lt.is_active && (
                  <span className="text-xs text-gray-500">
                    (Inactive)
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleLeaveType(lt)}
                  className="btn-secondary"
                >
                  {lt.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleDeleteLeaveType(lt.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeaveApproval;
