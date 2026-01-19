import { useEffect, useState } from "react";
import {
  getAllLeaves,
  updateLeaveStatus,
} from "../../api/leaveApi";
import Loader from "../../components/Loader";

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

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


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Leave Approvals</h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Employee</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-t">
                  <td className="px-4 py-2 text-center">
                    {leave.employee_name}
                  </td>
                  <td className="px-4 py-2">{leave.leave_type}</td>
                  <td className="px-4 py-2">{leave.start_date}</td>
                  <td className="px-4 py-2">{leave.end_date}</td>
                  <td className="px-4 py-2">{leave.reason}</td>
                  <td className="px-4 py-2">
                    {leave.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(leave.id, "APPROVED")}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(leave.id, "REJECTED")}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs rounded text-white ${leave.status === "APPROVED"
                            ? "bg-green-600"
                            : "bg-red-600"
                          }`}
                      >
                        {leave.status}
                      </span>
                    )}
                  </td>


                </tr>
              ))}

              {leaves.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6">
                    No pending leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;
