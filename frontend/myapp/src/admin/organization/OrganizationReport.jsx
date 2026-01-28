import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { getOrganizationReport } from "../../api/organizationApi";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// 🎨 Dashboard color palette
const COLORS = {
  blue: "#4f81ee",
  green: "#16A34A",
  purple: "#7C3AED",
  orange: "#F97316",
  pink: "#EC4899",
  teal: "#14B8A6",
};

const OrganizationReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await getOrganizationReport();
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load organization report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading report...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!report) return <p>No report data available</p>;

  return (
    <div className="space-y-8">

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Employees" value={report.summary.total_employees} />
        <SummaryCard title="Male" value={report.summary.male_employees} />
        <SummaryCard title="Female" value={report.summary.female_employees} />
        <SummaryCard title="Average Age" value={report.summary.average_age} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid md:grid-cols-2 gap-6">

        {/*  Gender Distribution */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-4 text-gray-700">
            Gender Distribution
          </h3>

          <Pie
            data={{
              labels: report.gender_chart.labels,
              datasets: [
                {
                  data: report.gender_chart.data,
                  backgroundColor: [
                    COLORS.blue,
                    COLORS.pink,
                    COLORS.purple,
                  ],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
            }}
          />
        </div>

        {/* Age Distribution */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-4 text-gray-700">
            Age Distribution
          </h3>

          <Bar
            data={{
              labels: report.age_chart.labels,
              datasets: [
                {
                  label: "Employees",
                  data: report.age_chart.data,
                  backgroundColor: COLORS.teal,
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 },
                },
              },
            }}
          />
        </div>
      </div>

      {/* ================= DEPARTMENT TABLE ================= */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-4 text-gray-700">
          Department-wise Employees
        </h3>

        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Department</th>
              <th className="border p-2 text-left">Count</th>
            </tr>
          </thead>
          <tbody>
            {report.department_chart.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">
                  {row.department || "Not Assigned"}
                </td>
                <td className="border p-2 font-medium">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default OrganizationReport;
