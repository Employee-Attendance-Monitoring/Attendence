import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EmployeeRelieve = () => {
  const { empId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH FULL EMPLOYEE DETAILS ================= */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${empId}/`);
        setEmployee(res.data);
      } catch (error) {
        alert("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [empId]);

  /* ================= CONFIRM RELIEVE ================= */
  const handleConfirmRelieve = async () => {
    if (!window.confirm("Are you sure you want to relieve this employee?")) return;

    try {
      await api.patch(`/employees/${empId}/relieve/`);
      alert("Employee relieved successfully");
      navigate("/admin/employees", { replace: true });
    } catch (error) {
      alert("Failed to relieve employee");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No employee found</p>;

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <img
          src={employee.photo || "/default-avatar.png"}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{employee.full_name}</h2>
          <p className="text-gray-500">
            Employee Code: <b>{employee.employee_code}</b>
          </p>
        </div>
      </div>

      {/* ================= BASIC DETAILS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Basic Details</h3>
          <p><b>Phone:</b> {employee.phone_number || "-"}</p>
          <p><b>Department:</b> {employee.department}</p>
          <p><b>Company:</b> {employee.company_name}</p>
          <p><b>Date of Joining:</b> {employee.date_of_joining}</p>
        </div>

        {/* ================= BANK DETAILS ================= */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Bank Details</h3>
          <p><b>Bank Name:</b> {employee.bank_detail?.bank_name || "-"}</p>
          <p><b>Account Number:</b> {employee.bank_detail?.account_number || "-"}</p>
          <p><b>IFSC Code:</b> {employee.bank_detail?.ifsc_code || "-"}</p>
        </div>
      </div>

      {/* ================= ID PROOF ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">ID Proof</h3>
        <p><b>PAN Number:</b> {employee.pancard_number || "-"}</p>
        <p><b>Aadhaar Number:</b> {employee.aadhaar_number || "-"}</p>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-300 rounded"
        >
          Back
        </button>

        <button
          onClick={handleConfirmRelieve}
          className="px-5 py-2 bg-red-600 text-white rounded"
        >
          Confirm Relieving
        </button>
      </div>
    </div>
  );
};

export default EmployeeRelieve;
