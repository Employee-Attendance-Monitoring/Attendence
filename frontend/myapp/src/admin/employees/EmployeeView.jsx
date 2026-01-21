import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b py-2">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900">{value || "-"}</span>
  </div>
);

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}/`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Failed to load employee", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return <p className="p-6">No employee found</p>;

  const photoUrl = employee.photo
    ? `${BACKEND_URL}${employee.photo}`
    : "/default-avatar.png";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white shadow rounded p-6 flex items-center gap-6">
        <img
          src={photoUrl}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          alt="Employee"
          className="w-32 h-32 rounded-full object-cover border"
        />

        <div>
          <h1 className="text-2xl font-bold">{employee.full_name}</h1>
          <p className="text-gray-600">
            Employee Code: <b>{employee.employee_code}</b>
          </p>
          <p className="text-gray-500">{employee.email}</p>
        </div>
      </div>

      {/* BASIC DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold text-lg mb-3">Basic Details</h2>
          <InfoRow label="Phone" value={employee.phone_number} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Company" value={employee.company_name} />
          <InfoRow label="Date of Joining" value={employee.date_of_joining} />
        </div>

        {/* BANK DETAILS */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold text-lg mb-3">Bank Details</h2>
          <InfoRow
            label="Bank Name"
            value={employee.bank_detail?.bank_name}
          />
          <InfoRow
            label="Account Number"
            value={employee.bank_detail?.account_number}
          />
          <InfoRow
            label="IFSC Code"
            value={employee.bank_detail?.ifsc_code}
          />
        </div>
      </div>

      {/* FAMILY MEMBERS */}
      {employee.family_members?.length > 0 && (
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold text-lg mb-4">Family Members</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {employee.family_members.map((m, i) => (
              <div
                key={i}
                className="border rounded p-4 bg-gray-50"
              >
                <p><b>Name:</b> {m.name}</p>
                <p><b>Relationship:</b> {m.relationship}</p>
                <p><b>Phone:</b> {m.phone_number || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end">
        <button
  onClick={() => navigate("/admin/employees")}
  className="
    px-6 py-2
    bg-blue-600 text-white
    rounded
    hover:bg-blue-700
    transition
  "
>
  Back
</button>

      </div>
    </div>
  );
};

export default EmployeeView;
