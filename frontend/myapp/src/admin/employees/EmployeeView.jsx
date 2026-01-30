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
    api.get(`/employees/${id}/`)
      .then((res) => setEmployee(res.data))
      .catch(() => alert("Failed to load employee"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return <p className="p-6">No employee found</p>;

  const photoUrl = employee.photo
    ? `${BACKEND_URL}${employee.photo}`
    : "/default-avatar.png";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white shadow rounded p-6 flex gap-6 items-center">
        <img
          src={photoUrl}
          onError={(e) => (e.target.src = "/default-avatar.png")}
          className="w-32 h-32 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-2xl font-bold">{employee.full_name}</h1>
          <p className="text-gray-600">Employee Code: {employee.employee_code}</p>
          <p className="text-gray-500">{employee.email_display}</p>
        </div>
      </div>

      {/* BASIC DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold mb-3">Basic Details</h2>
          <InfoRow label="Phone" value={employee.phone_number} />
          <InfoRow label="Gender" value={employee.gender} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Role" value={employee.role} />
          <InfoRow label="Grade" value={employee.grade} />
          <InfoRow label="Blood Group" value={employee.blood_group} />
          <InfoRow label="Date of Birth" value={employee.date_of_birth} />
          <InfoRow label="Date of Joining" value={employee.date_of_joining} />
        </div>

        {/* ADDRESS */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold mb-3">Address</h2>
          <p><b>Current:</b> {employee.current_address || "-"}</p>
          <p className="mt-2"><b>Permanent:</b> {employee.permanent_address || "-"}</p>
        </div>

        {/* BANK */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold mb-3">Bank Details</h2>
          <InfoRow label="Bank Name" value={employee.bank_detail?.bank_name} />
          <InfoRow label="Account No" value={employee.bank_detail?.account_number} />
          <InfoRow label="IFSC" value={employee.bank_detail?.ifsc_code} />
        </div>

        {/* ID */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold mb-3">ID Proof</h2>
          <InfoRow label="PAN" value={employee.pancard_number} />
          <InfoRow label="Aadhaar" value={employee.aadhaar_number} />
        </div>
      </div>

      {/* FAMILY MEMBERS */}
      {employee.family_members?.length > 0 && (
        <div className="bg-white shadow rounded p-6">
          <h2 className="font-semibold mb-4">Family Members</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {employee.family_members.map((m, i) => (
              <div key={i} className="border p-4 rounded bg-gray-50">
                <p><b>Name:</b> {m.name}</p>
                <p><b>Relationship:</b> {m.relationship}</p>
                <p><b>Phone:</b> {m.phone_number || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => navigate("/admin/employees")}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EmployeeView;
