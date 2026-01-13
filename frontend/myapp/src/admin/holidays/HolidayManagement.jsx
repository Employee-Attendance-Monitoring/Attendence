import { useEffect, useState } from "react";
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
} from "../../api/holidayApi";
import Loader from "../../components/Loader";

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  const loadHolidays = () => {
    setLoading(true);
    getHolidays()
      .then((res) => setHolidays(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const submitHoliday = async (e) => {
    e.preventDefault();
    await createHoliday(form);
    setForm({ name: "", date: "", description: "" });
    loadHolidays();
  };

  const removeHoliday = async (id) => {
    if (window.confirm("Delete this holiday?")) {
      await deleteHoliday(id);
      loadHolidays();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Holiday Management</h2>

      {/* ADD HOLIDAY */}
      <form
        onSubmit={submitHoliday}
        className="bg-white p-6 shadow rounded mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            required
            placeholder="Holiday Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />

          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2"
          >
            Add Holiday
          </button>
        </div>
      </form>

      {/* LIST */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Holiday</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="px-4 py-2">{h.date}</td>
                  <td className="px-4 py-2">{h.name}</td>
                  <td className="px-4 py-2">{h.description}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeHoliday(h.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {holidays.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    No holidays added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;
