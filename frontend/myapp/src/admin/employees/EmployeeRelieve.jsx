import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value || "-"}</span>
  </div>
);

const EmployeeRelieve = () => {
  const { empId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");
const [relieveFile, setRelieveFile] = useState(null);
const isRelieved = employee?.is_active === false;

  /* ================= FETCH EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${empId}/`);
        setEmployee(res.data);
      } catch {
        alert("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [empId]);

  /* ================= RELIEVE ================= */
const handleConfirmRelieve = async () => {
  if (isRelieved) return;

  if (!window.confirm("Are you sure you want to relieve this employee?")) return;

  try {
    const formData = new FormData();
    formData.append("relieved_remark", remark);

    if (relieveFile) {
      formData.append("relieved_file", relieveFile);
    }

    const res = await api.patch(
      `/employees/${empId}/relieve/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // UPDATE LOCAL STATE
    setEmployee((prev) => ({
      ...prev,
      is_active: false,
    }));

    alert("Employee relieved successfully ✅");
    // ✅ IMPORTANT
    navigate("/admin/employees", {
      state: { refreshed: true },
      replace: true
    });
  } catch (error) {
    alert(
      error.response?.data?.detail ||
      "Employee already relieved ❌"
    );
  }
};


  if (loading) return <p className="p-6">Loading...</p>;
  if (!employee) return <p className="p-6">No employee found</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ===== HEADER ===== */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <img
          src={employee.photo || "/default-avatar.png"}
          alt="profile"
          className="w-28 h-28 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold">{employee.full_name}</h2>
          <p className="text-gray-600">Employee Code: {employee.employee_code}</p>
          <p className="text-gray-500">{employee.email_display}</p>
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BASIC */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Basic Details</h3>
          <InfoRow label="Full Name" value={employee.full_name} />
          <InfoRow label="Gender" value={employee.gender} />
          <InfoRow label="Blood Group" value={employee.blood_group} />
          <InfoRow label="Date of Birth" value={employee.date_of_birth} />
          <InfoRow label="Phone Number" value={employee.phone_number} />
        </div>

        {/* WORK */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Work Details</h3>
          <InfoRow label="Company" value={employee.company_name} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Role" value={employee.role} />
          <InfoRow label="Grade" value={employee.grade} />
          <InfoRow label="Date of Joining" value={employee.date_of_joining} />
        </div>

        {/* ADDRESS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Address</h3>
          <InfoRow label="Current Address" value={employee.current_address} />
          <InfoRow label="Permanent Address" value={employee.permanent_address} />
        </div>

        {/* BANK */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Bank Details</h3>
          <InfoRow label="Bank Name" value={employee.bank_detail?.bank_name} />
          <InfoRow label="Account Number" value={employee.bank_detail?.account_number} />
          <InfoRow label="IFSC Code" value={employee.bank_detail?.ifsc_code} />
        </div>

        {/* ID PROOF */}
        <div className="bg-white p-6 rounded-xl shadow md:col-span-2">
          <h3 className="font-semibold mb-4">ID Proof</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoRow label="PAN Number" value={employee.pancard_number} />
            <InfoRow label="Aadhaar Number" value={employee.aadhaar_number} />
          </div>
        </div>
      </div>

      {/* FAMILY */}
      {employee.family_members?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Family Members</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {employee.family_members.map((m, i) => (
              <div key={i} className="border rounded p-4 bg-gray-50">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm">{m.relationship}</p>
                <p className="text-sm text-gray-500">{m.phone_number || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ===== RELIEVING DETAILS ===== */}
      {!isRelieved && (
<div className="bg-white p-6 rounded-xl shadow">
  <h3 className="font-semibold mb-4">Relieving Details</h3>

  <div className="mb-4">
    <label className="block text-sm text-gray-600 mb-1">
      Relieving Remark
    </label>
    <textarea
      rows="3"
      value={remark}
      onChange={(e) => setRemark(e.target.value)}
      placeholder="Enter relieving remark..."
      className="w-full border rounded px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-600 mb-1">
      Upload Relieving Document (optional)
    </label>
    <input
      type="file"
      onChange={(e) => setRelieveFile(e.target.files[0])}
      className="text-sm"
    />
  </div>
</div>
      )}


      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-300 rounded"
        >
          Back
        </button>

       <button
  onClick={handleConfirmRelieve}
  disabled={isRelieved}
  className={`px-6 py-2 rounded text-white
    ${isRelieved
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700"}
  `}
>
  {isRelieved ? "Relieved" : "Confirm Relieving"}
</button>

      </div>
    </div>
  );
};

export default EmployeeRelieve;
