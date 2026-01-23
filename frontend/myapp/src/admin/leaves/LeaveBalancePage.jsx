import { useEffect, useState } from "react";
import { getEmployeeDropdown } from "../../api/employeeApi";
import {
  setLeaveBalance,
  getLeaveSummary,
} from "../../api/leaveApi";

const LeaveBalancePage = () => {
  const [tab, setTab] = useState("ALL"); // ALL | INDIVIDUAL
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [totalLeave, setTotalLeave] = useState(12);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState(null);

  /* ================= LOAD EMPLOYEES ================= */
  useEffect(() => {
    getEmployeeDropdown().then((res) => {
      setEmployees(res.data || []);
    });
  }, []);

  /* ================= LOAD INDIVIDUAL SUMMARY ================= */
  useEffect(() => {
    if (tab === "INDIVIDUAL" && employee) {
      getLeaveSummary(employee).then((res) => {
        setSummary(res.data);
        setTotalLeave(res.data.total);
      });
    } else {
      setSummary(null);
    }
  }, [employee, tab]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!totalLeave || totalLeave <= 0) {
      alert("Please enter valid total leave");
      return;
    }

    if (tab === "INDIVIDUAL" && !employee) {
      alert("Please select an employee");
      return;
    }

    try {
      setLoading(true);

      if (tab === "ALL") {
        await setLeaveBalance({
          total_leaves: Number(totalLeave),
        });
        alert("Leave balance updated for all employees");
      } else {
        await setLeaveBalance({
          employee,
          total_leaves: Number(totalLeave),
        });
        alert("Leave balance updated for selected employee");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update leave balance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Leave Balance Management
      </h1>

      {/* ================= TABS ================= */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab("ALL")}
          className={`pb-2 ${
            tab === "ALL"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          All Employees
        </button>

        <button
          onClick={() => setTab("INDIVIDUAL")}
          className={`pb-2 ${
            tab === "INDIVIDUAL"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Individual Employee
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Leaves" value={summary.total} color="blue" />
          <Card title="Leaves Taken" value={summary.taken} color="red" />
          <Card title="Balance Leaves" value={summary.balance} color="green" />
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded shadow space-y-4 max-w-md">
        {tab === "INDIVIDUAL" && (
          <div>
            <label className="text-sm">Employee</label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.email} value={e.email}>
                  {e.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm">
            Total Leave (Year)
          </label>
          <input
            type="number"
            min="1"
            value={totalLeave}
            onChange={(e) =>
              setTotalLeave(Number(e.target.value))
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Leave Balance"}
        </button>
      </div>
    </div>
  );
};

/* ================= UI CARD ================= */

const Card = ({ title, value, color }) => (
  <div className="bg-white rounded-xl shadow border p-5">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className={`text-3xl font-bold text-${color}-600 mt-2`}>
      {value}
    </h2>
  </div>
);

export default LeaveBalancePage;
