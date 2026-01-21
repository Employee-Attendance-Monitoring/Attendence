import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ================= FETCH =================
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees/list/");
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const value = search.toLowerCase();
    setFilteredEmployees(
      employees.filter(
        (emp) =>
          emp.employee_code?.toLowerCase().includes(value) ||
          emp.full_name?.toLowerCase().includes(value) ||
          emp.email_display?.toLowerCase().includes(value) ||
          emp.department?.toLowerCase().includes(value)
      )
    );
  }, [search, employees]);

  if (loading) return <p>Loading employees...</p>;

  return (
    <div>
      {/* ================= PAGE HEADER ================= */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Employees
      </h1>

      {/* ================= SEARCH + ADD (FULL WIDTH) ================= */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* SEARCH BAR */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by Emp ID, Name, Email, Department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">
            🔍
          </span>
        </div>

        {/* ADD EMPLOYEE */}
        <Link
          to="/admin/employees/add"
          className="bg-blue-600 hover:bg-blue-700 text-white
                     px-6 py-3 rounded-lg whitespace-nowrap font-medium"
        >
          + Add Employee
        </Link>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">EMP ID</th>
              <th className="px-6 py-3 text-left">NAME</th>
              <th className="px-6 py-3 text-left">EMAIL</th>
              <th className="px-6 py-3 text-left">DEPARTMENT</th>
              <th className="px-6 py-3 text-right">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">
                    {emp.employee_code}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {emp.full_name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {emp.email_display}
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700
                                     px-3 py-1 rounded-full text-xs">
                      {emp.department}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => navigate(`/admin/employees/view/${emp.id}`)} className="text-blue-600 hover:underline">
                     View
                    </button>



                    <button
                      onClick={() =>
                        navigate(`/admin/employees/edit/${emp.id}`)
                      }
                      className="bg-yellow-500 hover:bg-yellow-600
                                 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        const newPass = prompt(
                          "Enter new temporary password"
                        );
                        if (!newPass) return;

                        await api.post(
                          `/accounts/reset-password/${emp.user_id}/`,
                          { password: newPass }
                        );

                        alert("Password reset successfully");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700
                                 text-white px-3 py-1 rounded text-xs"
                    >
                      Reset
                    </button>

                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete this employee?")) return;
                        await api.delete(`/employees/${emp.id}/delete/`);
                        setEmployees(
                          employees.filter((e) => e.id !== emp.id)
                        );
                      }}
                      className="bg-red-600 hover:bg-red-700
                                 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
