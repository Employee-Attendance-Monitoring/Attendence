import { useEffect, useState } from "react";
import { getHolidays } from "../../api/holidayApi";
import Loader from "../../components/Loader";

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHolidays()
      .then((res) => setHolidays(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Holiday Calendar</h2>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm">
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
                <td className="px-4 py-2 font-medium">{h.name}</td>
                <td className="px-4 py-2">{h.description}</td>
              </tr>
            ))}

            {holidays.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6">
                  No holidays configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HolidayCalendar;
