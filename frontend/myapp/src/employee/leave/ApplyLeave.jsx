import { useEffect, useState } from "react";
import { applyLeave, getMyLeaves } from "../../api/leaveApi";
import Loader from "../../components/Loader";

const ApplyLeave = () => {
  const [form, setForm] = useState({
    leave_type: "PAID",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLeaves = () => {
    setLoading(true);
    getMyLeaves()
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const submitLeave = async (e) => {
    e.preventDefault();
    await applyLeave(form);
    setForm({
      leave_type: "PAID",
      start_date: "",
      end_date: "",
      reason: "",
    });
    loadLeaves();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Leave Management</h2>

      {/* APPLY FORM */}
      <form
        onSubmit={submitLeave}
        className="bg-white p-6 shadow rounded mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={form.leave_type}
            onChange={(e) =>
              setForm({ ...form, leave_type: e.target.value })
            }
            className="border px-3 py-2 rounded"
          >
            <option value="PAID">Paid Leave</option>
            <option value="SICK">Sick Leave</option>
            <option value="CASUAL">Casual Leave</option>
          </select>

          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />

          <input
            type="date"
            required
            value={form.end_date}
            onChange={(e) =>
              setForm({ ...form, end_date: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            Apply Leave
          </button>
        </div>

        <textarea
          className="border w-full mt-4 p-2 rounded"
          placeholder="Reason"
          value={form.reason}
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
        />
      </form>

      {/* HISTORY */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-t">
                  <td className="px-4 py-2">{leave.leave_type}</td>
                  <td className="px-4 py-2">{leave.start_date}</td>
                  <td className="px-4 py-2">{leave.end_date}</td>
                  <td className="px-4 py-2">{leave.reason}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded text-white ${
                        leave.status === "APPROVED"
                          ? "bg-green-600"
                          : leave.status === "REJECTED"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}

              {leaves.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    No leave records
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

export default ApplyLeave;
