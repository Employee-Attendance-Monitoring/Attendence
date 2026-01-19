import { useEffect, useState } from "react";
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
  getHolidayCalendar,
  uploadHolidayCalendar,
} from "../../api/holidayApi";
import Loader from "../../components/Loader";

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [calendarFile, setCalendarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");


  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const [holidaysRes, calendarRes] = await Promise.all([
        getHolidays(),
        getHolidayCalendar(),
      ]);
      setHolidays(holidaysRes.data);
      setCalendar(calendarRes.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= UPLOAD CALENDAR ================= */
 const uploadCalendar = async (e) => {
  e.preventDefault();
  if (!calendarFile) return;

  const formData = new FormData();
  formData.append("file", calendarFile);

  await uploadHolidayCalendar(formData);

  setCalendarFile(null);
  setSuccessMessage("Holiday calendar uploaded successfully ✅");

  loadData();

  // auto-hide message after 3 seconds
  setTimeout(() => {
    setSuccessMessage("");
  }, 3000);
};


  /* ================= ADD MANUAL HOLIDAY ================= */
  const submitHoliday = async (e) => {
    e.preventDefault();
    await createHoliday(form);
    setForm({ name: "", date: "", description: "" });
    loadData();
  };

  /* ================= DELETE HOLIDAY ================= */
  const removeHoliday = async (id) => {
    if (window.confirm("Delete this holiday?")) {
      await deleteHoliday(id);
      loadData();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Holiday Management</h2>

      {/* ================= HOLIDAY CALENDAR UPLOAD ================= */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h3 className="text-lg font-semibold mb-3">Holiday Calendar</h3>
        {successMessage && (
  <div className="mb-3 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded">
    {successMessage}
  </div>
)}


        <form onSubmit={uploadCalendar} className="flex gap-4 items-center">
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,image/*"
            onChange={(e) => setCalendarFile(e.target.files[0])}
            className="border px-3 py-2 rounded"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload Calendar
          </button>

          {calendar && (
            <a
              href={`http://localhost:8000${calendar.file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Calendar
            </a>

          )}
        </form>
      </div>

      {/* ================= ADD MANUAL HOLIDAY ================= */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h3 className="text-lg font-semibold mb-3">Add Additional Holiday</h3>

        <form onSubmit={submitHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            required
            placeholder="Holiday Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded"
          />

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
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
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Holiday
          </button>
        </form>
      </div>

      {/* ================= HOLIDAY LIST ================= */}
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full text-sm text-center">
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
                  <td className="px-4 py-2">{h.description || "-"}</td>
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
                  <td colSpan="4" className="py-6 text-center">
                    No additional holidays added
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
