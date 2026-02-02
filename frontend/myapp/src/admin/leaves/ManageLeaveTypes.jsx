import { useEffect, useState } from "react";
import {
  getAdminLeaveTypes,
  addLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../../api/leaveApi";

const ManageLeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newLeaveType, setNewLeaveType] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const loadLeaveTypes = async () => {
    const res = await getAdminLeaveTypes();
    setLeaveTypes(res.data || []);
  };

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  /* ================= ADD ================= */
  const handleAddLeaveType = async () => {
    if (!newLeaveType.trim()) return;

    await addLeaveType({ name: newLeaveType });
    setNewLeaveType("");
    loadLeaveTypes();
  };

  /* ================= UPDATE ================= */
  const handleEdit = (lt) => {
    setEditingId(lt.id);
    setEditName(lt.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;

    await updateLeaveType(id, { name: editName });
    setEditingId(null);
    setEditName("");
    loadLeaveTypes();
  };

  /* ================= DELETE ================= */
  const handleDeleteLeaveType = async (id) => {
    if (!window.confirm("Delete leave type?")) return;

    await deleteLeaveType(id);
    loadLeaveTypes();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4">
        Manage Leave Types
      </h3>

      {/* ADD */}
      <div className="flex gap-2 mb-6">
        <input
          className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New leave type"
          value={newLeaveType}
          onChange={(e) => setNewLeaveType(e.target.value)}
        />
        <button
          onClick={handleAddLeaveType}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <ul className="divide-y">
        {leaveTypes.map((lt) => (
          <li
            key={lt.id}
            className="flex justify-between items-center py-3"
          >
            {/* NAME / EDIT */}
            {editingId === lt.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border px-2 py-1 rounded w-1/2"
              />
            ) : (
              <span className="font-medium">{lt.name}</span>
            )}

            {/* ACTIONS */}
            <div className="flex gap-2">
              {editingId === lt.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(lt.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(lt)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLeaveType(lt.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}

        {leaveTypes.length === 0 && (
          <li className="py-6 text-center text-gray-500">
            No leave types found
          </li>
        )}
      </ul>
    </div>
  );
};

export default ManageLeaveTypes;
