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
const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
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

const relievedFileUrl = employee.relieved_file
  ? `${BACKEND_URL}${employee.relieved_file}`
  : null;

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-6">

    {/* ===== PROFILE HEADER ===== */}
    <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
      <img
        src={photoUrl}
        onError={(e) => (e.target.src = "/default-avatar.png")}
        className="w-36 h-36 rounded-full object-cover border"
      />

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-800">
          {employee.full_name}
        </h1>
        <p className="text-gray-500 mt-1">
          {employee.email_display}
        </p>

        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Emp Code: {employee.employee_code}
          </span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {employee.department}
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {employee.role}
          </span>
        </div>
      </div>
    </div>

    {/* ===== GRID ===== */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* BASIC INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          👤 Basic Information
        </h2>
        <InfoRow label="Phone Number" value={employee.phone_number} />
        <InfoRow label="Gender" value={employee.gender} />
        <InfoRow label="Blood Group" value={employee.blood_group} />
        <InfoRow label="Date of Birth" value={employee.date_of_birth} />
      </div>

      {/* WORK INFO */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          🏢 Work Information
        </h2>
        <InfoRow label="Department" value={employee.department} />
        <InfoRow label="Role" value={employee.role} />
        <InfoRow label="Grade" value={employee.grade} />
        <InfoRow label="Date of Joining" value={employee.date_of_joining} />
      </div>

      {/* ADDRESS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          📍 Address
        </h2>
        <p className="text-sm text-gray-600">
          <b>Current:</b><br /> {employee.current_address || "-"}
        </p>
        <p className="text-sm text-gray-600 mt-3">
          <b>Permanent:</b><br /> {employee.permanent_address || "-"}
        </p>
      </div>

      {/* BANK */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          🏦 Bank Details
        </h2>
        <InfoRow label="Bank Name" value={employee.bank_detail?.bank_name} />
        <InfoRow label="Account Number" value={employee.bank_detail?.account_number} />
        <InfoRow label="IFSC Code" value={employee.bank_detail?.ifsc_code} />
      </div>

      {/* ID PROOF */}
      <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          🪪 ID Proof
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow label="PAN Number" value={employee.pancard_number} />
          <InfoRow label="Aadhaar Number" value={employee.aadhaar_number} />
        </div>
      </div>

    </div>

    {/* FAMILY MEMBERS */}
    {employee.family_members?.length > 0 && (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          👨‍👩‍👧 Family Members
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {employee.family_members.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 bg-gray-50">
              <p className="font-semibold text-gray-800">NAME : {m.name}</p>
              <p className=" font-semibold text-sm text-gray-800">Relationship : {m.relationship}</p>
              <p className="text-sm text-gray-500 mt-1">
                📞 {m.phone_number || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
    {/* ===== RELIEVING DETAILS ===== */}
{employee.is_active === false && (
  <div className="bg-red-50 rounded-xl shadow p-6 mt-6">
    <h2 className="text-lg font-semibold mb-4 text-red-700">
      🚫 Relieving Details
    </h2>

    <InfoRow
      label="Relieved On"
      value={
        employee.relieved_at
          ? formatDate(employee.relieved_at)
          : "-"
      }
    />

    <InfoRow
      label="Relieving Remark"
      value={employee.relieved_remark || "-"}
    />

    {relievedFileUrl && (
  <div className="flex justify-between items-center border-b py-2">
    <span className="font-medium text-gray-600">
      Relieving Document
    </span>

    <div className="flex gap-3">
      {/* VIEW PDF */}
      <a
        href={relievedFileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View PDF
      </a>

      {/* DOWNLOAD PDF */}
      <a
        href={relievedFileUrl}
        download
        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Download
      </a>
    </div>
  </div>
)}

  </div>
)}

    {/* ACTIONS */}
    <div className="flex justify-end">
      <button
        onClick={() => navigate("/admin/employees")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
      >
        ← Back to Employees
      </button>
    </div>

  </div>
);

};

export default EmployeeView;
