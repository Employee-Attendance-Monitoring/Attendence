import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`employees/${id}/`);
      setEmail(res.data.email);
    } catch (error) {
      alert("Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`employees/${id}/`, {
        email,
      });

      alert("Employee updated");
      navigate("/admin/employees");
    } catch (error) {
      alert("Failed to update employee");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">Edit Employee</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        <button type="submit" className="bg-blue-600 text-white w-full py-2">
          Update
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
