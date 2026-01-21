import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

const EmployeeView = () => {
  console.log("EmployeeView mounted"); // ✅ PUT IT HERE

  const { id } = useParams();
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

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No data</p>;

  return (
    <div>
      <h1 className="text-xl font-bold">{employee.full_name}</h1>
    </div>
  );
};

export default EmployeeView;
