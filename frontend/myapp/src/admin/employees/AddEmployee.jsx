import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AddEmployee = () => {
  const navigate = useNavigate();

  // Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Employee profile fields
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      await api.post("/employees/create/", {
        email: email,
        password: password,
        employee_code: employeeCode,
        full_name: fullName,
        department: department,
        company_name: companyName,
        date_of_joining: dateOfJoining,
      });

      alert("Employee created successfully ✅");
      navigate("/admin/employees");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Failed to create employee ❌"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Add Employee</h1>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <input
          type="email"
          placeholder="Employee Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Employee Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Employee Code */}
        <input
          type="text"
          placeholder="Employee Code (e.g. EMP001)"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Department */}
        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Company Name */}
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        {/* Date of Joining */}
        <h6>Date of joining</h6>
        <input
          type="date"
          value={dateOfJoining}
          onChange={(e) => setDateOfJoining(e.target.value)}
          className="border p-2 w-full mb-4"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {submitting ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
