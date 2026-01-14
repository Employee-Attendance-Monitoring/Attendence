import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees/list/");
        setEmployees(res.data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Employees</h1>
        <Link
          to="/admin/employees/add"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Employee
        </Link>
      </div>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="border p-2">{emp.id}</td>
                <td className="border p-2">{emp.email_display}</td>
                <td className="border p-2">{emp.full_name}</td>
                <td className="border p-2">{emp.department}</td>

                <td className="border p-2 flex gap-2">
                  {/* EDIT */}
                  <button
                    onClick={() =>
                      navigate(`/admin/employees/edit/${emp.id}`)
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this employee?")) return;
                      await api.delete(
                        `/employees/${emp.id}/delete/`
                      );
                      setEmployees(
                        employees.filter((e) => e.id !== emp.id)
                      );
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                  {/* RESET PASSWORD */}
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
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
