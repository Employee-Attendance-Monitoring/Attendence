import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/organizationApi";

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null); // ✅ IMPORTANT

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data || []);
  };

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!name) return alert("Enter department name");

    await createDepartment({ name });
    setName("");
    loadDepartments();
  };

  /* ================= SELECT FOR EDIT ================= */
  const handleEditSelect = (dept) => {
    setEditingId(dept.id);
    setName(dept.name);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!editingId) return alert("Select a department first");

    try {
      await updateDepartment(editingId, { name });
      alert("Department updated ✅");
      setEditingId(null);
      setName("");
      loadDepartments();
    } catch {
      alert("Update failed ❌");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!editingId) return alert("Select a department first");

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await deleteDepartment(editingId);
      alert("Department deleted ✅");
      setEditingId(null);
      setName("");
      loadDepartments();
    } catch {
      alert("Delete failed ❌");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Departments</h1>

      {/* INPUT + ACTIONS */}
      <div className="flex gap-2 items-center">
        <input
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      {/* LIST */}
      <ul className="bg-white rounded shadow divide-y">
        {departments.map((d) => (
          <li
            key={d.id}
            onClick={() => handleEditSelect(d)}
            className={`p-3 cursor-pointer flex justify-between ${
              editingId === d.id
                ? "bg-blue-50 font-semibold"
                : "hover:bg-gray-50"
            }`}
          >
            {d.name}
            {editingId === d.id && (
              <span className="text-xs text-blue-600">
                selected
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DepartmentPage;
