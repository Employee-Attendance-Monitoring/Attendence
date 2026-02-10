import { useEffect, useState } from "react";
import { getPolicies, createPolicy ,deletePolicy,togglePolicyStatus,} from "../../api/policiesApi";

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // upload form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HR");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleToggleStatus = async (id) => {
  if (!window.confirm("Do you want to change policy status?")) return;

  try {
    await togglePolicyStatus(id);
    fetchPolicies(); // refresh list
  } catch (err) {
    console.error("Status update failed:", err);
    alert("Failed to update policy status");
  }
};


  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this policy?")) return;

  try {
    await deletePolicy(id);
    alert("Policy deleted successfully");

    // refresh list
    fetchPolicies();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Delete failed");
  }
};


  const fetchPolicies = async () => {
  setLoading(true); // 👈 ADD THIS

  try {
    const res = await getPolicies();
    setPolicies(res.data.results ?? res.data);
  } catch (err) {
    console.error("Fetch policies error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !effectiveDate || !file) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("effective_date", effectiveDate);
    formData.append("file", file);

    try {
      setUploading(true);
      await createPolicy(formData);
      alert("Policy uploaded successfully");

      // reset form
      setTitle("");
      setCategory("HR");
      setEffectiveDate("");
      setFile(null);

      fetchPolicies();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
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
          Upload and manage company policy documents
        </p>
      </div>

      {/* UPLOAD FORM */}
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow border mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Upload New Policy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="text-sm text-gray-600">Policy Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Code of Conduct"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="FINANCE">Finance</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          {/* Effective Date */}
          <div>
            <label className="text-sm text-gray-600">
              Effective Date
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          {/* File */}
          <div>
            <label className="text-sm text-gray-600">
              Policy File (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Policy"}
          </button>
        </div>
      </form>

      {/* POLICIES TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Effective Date</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>

            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : policies.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500"
                >
                  No policies found
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {policy.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {policy.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {policy.effective_date}
                  </td>
                  <td className="px-6 py-4">
  {policy.is_active ? (
    <button
      onClick={() => handleToggleStatus(policy.id)}
      className="px-3 py-1 text-xs rounded-full font-semibold
                 bg-green-100 text-green-700 hover:bg-green-200"
    >
      Active
    </button>
  ) : (
    <button
      onClick={() => handleToggleStatus(policy.id)}
      className="px-3 py-1 text-xs rounded-full font-semibold
                 bg-red-100 text-red-700 hover:bg-red-200"
    >
      Inactive
    </button>
  )}
</td>

                  <td className="px-6 py-4">
  <button
    onClick={() => handleDelete(policy.id)}
    className="text-red-600 hover:text-red-800 text-sm font-medium"
  >
    Delete
  </button>
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

export default AdminPolicies;
