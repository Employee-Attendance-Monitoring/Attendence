import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    employee_code: "",
    name: "",
    department: "",
    company: "",
    date_of_joining: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
    // eslint-disable-next-line
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}/`);

      setFormData({
        email: res.data.email || "",
        employee_code: res.data.employee_code || "",
        name: res.data.name || "",
        department: res.data.department || "",
        company: res.data.company || "",
        date_of_joining: res.data.date_of_joining || "",
      });
    } catch (error) {
      alert("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/employees/${id}/`, formData);
      alert("Employee updated successfully");
      navigate("/admin/employees");
    } catch (error) {
      alert("Failed to update employee");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Email"
          required
        />

        <input
          type="text"
          name="employee_code"
          value={formData.employee_code}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Employee Code"
          required
        />

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Full Name"
          required
        />

        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Department"
        />

        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Company Name"
        />

        <input
          type="date"
          name="date_of_joining"
          value={formData.date_of_joining}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2"
        >
          Update Employee
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
