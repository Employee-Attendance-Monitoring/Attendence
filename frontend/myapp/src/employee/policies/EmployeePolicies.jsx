import { useEffect, useState } from "react";
import { getPolicies } from "../../api/policiesApi";

const EmployeePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await getPolicies();
      setPolicies(res.data.results ?? res.data);
    } catch (err) {
      console.error("Fetch employee policies error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Company Policies
        </h2>
        <p className="text-sm text-gray-500">
          Official company policies issued by management
        </p>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3 text-left">Policy Title</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Effective Date</th>
              <th className="px-6 py-3 text-left">Document</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500"
                >
                  Loading policies...
                </td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500"
                >
                  No policies available
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* TITLE */}
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {policy.title}
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                      {policy.category}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {policy.effective_date}
                  </td>

                  {/* FILE */}
                  <td className="px-6 py-4">
                    {policy.file ? (
                      <a
                        href={policy.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No file
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeePolicies;
