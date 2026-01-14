import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      await api.post("accounts/create-employee/", {
        email,
        password,
      });

      alert("Employee created successfully");
      navigate("/admin/employees");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create employee");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Add Employee</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Employee Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        <input
          type="password"
          placeholder="Temporary Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white w-full py-2"
        >
          {submitting ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
