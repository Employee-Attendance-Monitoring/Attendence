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
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ===== REJECT REMARK STATE ===== */
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [remark, setRemark] = useState("");

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
    if (status === "REJECTED") {
      setSelectedLeaveId(id);
      setRemark("");
      setShowRejectModal(true);
      return;
    }

    try {
      setActionLoadingId(id);
      await updateLeaveStatus(id, { status: "APPROVED" });
      loadLeaves();
    } catch {
      alert("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmReject = async () => {
    if (!remark.trim()) {
      alert("Rejection remark is required");
      return;
    }

    try {
      setActionLoadingId(selectedLeaveId);

      await updateLeaveStatus(selectedLeaveId, {
        status: "REJECTED",
        rejection_reason: remark,
      });

      /* ✅ ENSURE REASON SHOWS IMMEDIATELY */
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === selectedLeaveId
            ? {
                ...l,
                status: "REJECTED",
                rejection_reason: remark,
              }
            : l
        )
      );

      setShowRejectModal(false);
    } catch {
      alert("Reject failed");
    } finally {
      setActionLoadingId(null);
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
      const empOk =
        employeeFilter === "ALL" ||
        leave.employee_email === employeeFilter;
      const statusOk =
        statusFilter === "ALL" || leave.status === statusFilter;
      return empOk && statusOk;
    });
  }, [leaves, employeeFilter, statusFilter]);

  /* ================= STATUS BADGE ================= */
  const StatusBadge = ({ status }) => {
    const map = {
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-full ${map[status]}`}>
        {status}
      </span>
    );
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Leave Approvals
        </h2>
        <p className="text-sm text-gray-500">
          Review and manage employee leave requests
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Employee</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1"
          >
            <option value="ALL">All Employees</option>
            {employeeOptions.map((email) => (
              <option key={email}>{email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* LEAVE TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        {loading ? (
          <Loader />
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Leave Type</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status / Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No leave requests
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave, i) => (
                  <tr
                    key={leave.id}
                    className={`border-t ${
                      i % 2 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3">{leave.employee_email}</td>
                    <td className="p-3 text-center">
                      {leave.leave_type_name}
                    </td>
                    <td className="p-3 text-center">{leave.start_date}</td>
                    <td className="p-3 text-center">{leave.end_date}</td>
                    <td className="p-3 text-center">
                      {leave.reason || "-"}
                    </td>

                    <td className="p-3 text-center">
                      {leave.status === "PENDING" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            disabled={actionLoadingId === leave.id}
                            onClick={() =>
                              handleAction(leave.id, "APPROVED")
                            }
                            className="btn-success"
                          >
                            Approve
                          </button>
                          <button
                            disabled={actionLoadingId === leave.id}
                            onClick={() =>
                              handleAction(leave.id, "REJECTED")
                            }
                            className="btn-danger"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <StatusBadge status={leave.status} />
                          {leave.status === "REJECTED" &&
                            leave.rejection_reason && (
                              <p className="text-xs text-red-600">
                                Reason: {leave.rejection_reason}
                              </p>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>


      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              Reject Leave Request
            </h3>

            <textarea
              className="w-full border rounded-md p-2 mb-4"
              rows="4"
              placeholder="Enter rejection reason"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoadingId === selectedLeaveId}
                className="btn-danger"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
