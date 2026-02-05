import { useEffect, useState } from "react";
import { getEmployeeDropdown } from "../../api/employeeApi";
import {
  setLeaveBalance,
  getLeaveSummary,
} from "../../api/leaveApi";

const LeaveBalancePage = () => {
  const [tab, setTab] = useState("ALL"); // ALL | INDIVIDUAL
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(""); // email
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [totalLeave, setTotalLeave] = useState(0);
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
        await setLeaveBalance({ total_leaves: Number(totalLeave) });
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

  /* ================= FILTER ================= */
  const filteredEmployees = employees.filter((e) =>
    `${e.employee_code || ""} ${e.full_name || ""} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

      {/* ================= SUMMARY ================= */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Leaves" value={summary.total} />
          <Card title="Leaves Taken" value={summary.taken} />
          <Card title="Balance Leaves" value={summary.balance} />
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded shadow space-y-4 max-w-md">

        {/* ===== SEARCHABLE EMPLOYEE DROPDOWN ===== */}
        {tab === "INDIVIDUAL" && (
          <div className="relative">
            <label className="text-sm">Employee</label>

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="EMP / Name / Email"
              className="w-full border px-3 py-2 rounded"
            />

            {showDropdown && (
              <div className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-y-auto mt-1">
                {filteredEmployees.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">
                    No employees found
                  </div>
                )}

                {filteredEmployees.map((e) => (
                  <div
                    key={e.email}
                    onClick={() => {
                      setEmployee(e.email);
                      setSearch(
                        `${e.employee_code || ""} ${e.full_name || ""}`
                      );
                      setShowDropdown(false);
                    }}
                    className="p-3 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="font-medium">
                      {e.employee_code || "EMP"} {e.full_name || ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {e.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== TOTAL LEAVE ===== */}
        <div>
          <label className="text-sm">Total Leave (Year)</label>
          <input
            type="number"
            min="0"
            value={totalLeave}
            onChange={(e) => setTotalLeave(Number(e.target.value))}
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

/* ================= CARD ================= */
const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border p-5">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

export default LeaveBalancePage;
