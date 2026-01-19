import { useEffect, useState } from "react";
import { getHolidayCalendar, getHolidays } from "../../api/holidayApi";
import Loader from "../../components/Loader";
const BACKEND_URL = "http://localhost:8000";

const HolidayCalendar = () => {
  const [calendar, setCalendar] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHolidayCalendar(), getHolidays()])
      .then(([calendarRes, holidayRes]) => {
        setCalendar(calendarRes.data);
        setHolidays(holidayRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Holidays</h2>

      {/* CALENDAR FILE */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h3 className="font-semibold mb-2">Holiday Calendar</h3>

        {calendar ? (
          <a
            href={`${BACKEND_URL}${calendar.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Holiday Calendar
          </a>
        ) : (
          <p className="text-gray-500">No holiday calendar uploaded</p>
        )}
      </div>

      {/* MANUAL HOLIDAYS */}
      <div className="bg-white p-6 shadow rounded">
        <h3 className="font-semibold mb-4">Additional Holidays</h3>

        {holidays.length === 0 ? (
          <p className="text-gray-500">No holidays announced</p>
        ) : (
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Holiday</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} className="border-t">
                  <td className="px-4 py-2">{h.date}</td>
                  <td className="px-4 py-2">{h.name}</td>
                  <td className="px-4 py-2">{h.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HolidayCalendar;
