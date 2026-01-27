import { useEffect, useState } from "react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../api/organizationApi";

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null); // ✅ track selected role

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const res = await getRoles();
    setRoles(res.data || []);
  };

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!name) return alert("Enter role name");

    await createRole({ name });
    setName("");
    loadRoles();
  };

  /* ================= SELECT ================= */
  const handleEditSelect = (role) => {
    setEditingId(role.id);
    setName(role.name);
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    if (!editingId) return alert("Select a role first");

    try {
      await updateRole(editingId, { name });
      alert("Role updated ✅");
      setEditingId(null);
      setName("");
      loadRoles();
    } catch {
      alert("Update failed ❌");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!editingId) return alert("Select a role first");

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await deleteRole(editingId);
      alert("Role deleted ✅");
      setEditingId(null);
      setName("");
      loadRoles();
    } catch {
      alert("Delete failed ❌");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Roles</h1>

      {/* INPUT + ACTIONS */}
      <div className="flex gap-2 items-center">
        <input
          placeholder="Role name"
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
        {roles.map((r) => (
          <li
            key={r.id}
            onClick={() => handleEditSelect(r)}
            className={`p-3 cursor-pointer flex justify-between ${
              editingId === r.id
                ? "bg-blue-50 font-semibold"
                : "hover:bg-gray-50"
            }`}
          >
            {r.name}
            {editingId === r.id && (
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

export default RolePage;
