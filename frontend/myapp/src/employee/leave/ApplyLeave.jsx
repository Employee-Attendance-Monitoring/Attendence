import { useEffect, useState } from "react";
import {
  applyLeave,
  getMyLeaves,
  getLeaveTypes,
} from "../../api/leaveApi";
import Loader from "../../components/Loader";
import { getMyProfile } from "../../api/employeeApi";

const ApplyLeave = () => {
  // ================= STATE =================
  const [employee, setEmployee] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState("");

  const [form, setForm] = useState({
    leave_type: "",
    start_date: "",
    leave_days: 1,
    is_half_day: "FULL",
    is_comp_off: false,
    reason: "",
  });

  const formatDateDMY = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
};


  // ================= LOAD DATA =================
  useEffect(() => {
    getMyProfile().then((res) => setEmployee(res.data));
    getLeaveTypes().then((res) => setLeaveTypes(res.data));
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    setLoading(true);
    getMyLeaves()
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  // ================= AUTO END DATE =================
  useEffect(() => {
    if (!form.start_date || !form.leave_days) {
      setEndDate("");
      return;
    }
    const start = new Date(form.start_date);
    const days = Math.max(Number(form.leave_days) - 1, 0);
    start.setDate(start.getDate() + days);
    setEndDate(start.toISOString().split("T")[0]);
  }, [form.start_date, form.leave_days]);

  // ================= SUBMIT =================
 const submitLeave = async (e) => {
  e.preventDefault();

  try {
    await applyLeave({
      leave_type: form.leave_type,
      start_date: form.start_date,
      leave_days:
  form.is_half_day === "FULL" ? form.leave_days : 0.5,

      is_half_day: form.is_half_day,
      is_comp_off: form.is_comp_off,
      reason: form.reason,
    });

    alert("Leave applied successfully"); // SUCCESS ALERT

    setForm({
      leave_type: "",
      start_date: "",
      leave_days: 1,
      is_half_day: "FULL",
      is_comp_off: false,
      reason: "",
    });

    loadLeaves();
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to apply leave");
  }
};


  if (!employee) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Leave Application
      </h2>

      {/* ================= EMPLOYEE DETAILS ================= */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">
          Employee Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Employee Code</label>
            <input
              disabled
              className="input-readonly"
              value={employee.employee_code}
            />
          </div>

          <div>
            <label className="label">Name of Company</label>
            <input
              disabled
              className="input-readonly"
              value={employee.company_name}
            />
          </div>

          <div>
            <label className="label">Employee Name</label>
            <input
              disabled
              className="input-readonly"
              value={employee.full_name}
            />
          </div>

          <div>
            <label className="label">Employee Contact No</label>
            <input
              disabled
              className="input-readonly"
              value={employee.phone_number}
            />
          </div>
        </div>
      </div>

      {/* ================= APPLY LEAVE ================= */}
      <form onSubmit={submitLeave} className="bg-white p-6 rounded shadow mb-8">
        <h3 className="font-semibold mb-4 text-gray-700">
          Leave Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Leave Start Date *</label>
            <input
              type="date"
              className="input"
              value={form.start_date}
              onChange={(e) =>
                setForm({ ...form, start_date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="label">Leave Days *</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              className="input"
              disabled={form.is_half_day !== "FULL"}
              value={form.leave_days}
              onChange={(e) =>
                setForm({ ...form, leave_days: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Is Half Day *</label>
            <select
              className="input"
              value={form.is_half_day}
              onChange={(e) =>
                setForm({ ...form, is_half_day: e.target.value })
              }
            >
              <option value="FULL">Full Day</option>
              <option value="FIRST_HALF">1st Half</option>
              <option value="SECOND_HALF">2nd Half</option>
            </select>
          </div>

          <div>
            <label className="label">Leave End Date</label>
            <input
              readOnly
              className="input-readonly"
              value={formatDateDMY(endDate)}
            />
          </div>

          <div>
            <label className="label">Leave Type *</label>
            <select
              className="input"
              value={form.leave_type}
              onChange={(e) =>
                setForm({ ...form, leave_type: e.target.value })
              }
              required
            >
              <option value="">Select</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.is_comp_off}
              onChange={(e) =>
                setForm({ ...form, is_comp_off: e.target.checked })
              }
            />
            <label className="text-sm font-medium">
              Add Comp Off
            </label>
          </div> */}
        </div>

        <div className="mt-4">
          <label className="label">Reason for Leave</label>
          <textarea
            rows="3"
            className="input"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />
        </div>

        <div className="mt-6 text-right">
          <button className="btn-primary">
            Apply Leave
          </button>
        </div>
      </form>

      {/* ================= LEAVE HISTORY ================= */}
      <div className="bg-white rounded-xl shadow">
  <h3 className="font-semibold p-4 border-b text-gray-700">
    Leave History
  </h3>

  {loading ? (
    <Loader />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">From</th>
            <th className="px-4 py-3 text-left">To</th>
            <th className="px-4 py-3 text-center">Days</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-left">Remark</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {leaves.map((l) => (
            <tr key={l.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                {l.leave_type_name || l.leave_type}
              </td>

              <td className="px-4 py-3">{formatDateDMY(l.start_date)}</td>
              <td className="px-4 py-3">{formatDateDMY(l.end_date)}</td>


              <td className="px-4 py-3 text-center">
                {l.leave_days}
              </td>

              {/* STATUS */}
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center justify-center min-w-[90px] px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      l.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : l.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                >
                  {l.status}
                </span>
              </td>

              {/* REMARK */}
              <td className="px-4 py-3">
                {l.status === "REJECTED" && l.rejection_reason ? (
                  <p className="text-xs text-red-600 leading-relaxed">
                    {l.rejection_reason}
                  </p>
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </td>
            </tr>
          ))}

          {leaves.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-6 text-center text-gray-500"
              >
                No leave records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>

    </div>
  );
};

export default ApplyLeave;
