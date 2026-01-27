import { useEffect, useState } from "react";
import {
  getOrganization,
  createOrganization,
  updateOrganization,
} from "../../api/organizationApi";

import DepartmentPage from "../department/DepartmentPage";
import RolePage from "../role/RolePage";

const OrganizationPage = () => {
  const [activeTab, setActiveTab] = useState("ORG"); // ORG | DEPT | ROLE

  const [org, setOrg] = useState(null);
  const [editing, setEditing] = useState(false); // ✅ NEW

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    emp_prefix: "EMP",
  });

  /* ================= LOAD ORGANIZATION ================= */
  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      const res = await getOrganization();
      setOrg(res.data);
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        state: res.data.state || "",
        emp_prefix: res.data.emp_prefix || "EMP",
      });
    } catch {
      setOrg(null);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    await createOrganization(form);
    alert("Organization created ✅");
    loadOrganization();
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    await updateOrganization(form);
    alert("Organization updated ✅");
    setEditing(false);
    loadOrganization();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization</h1>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b">
        {["ORG", "DEPT", "ROLE"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 font-medium ${
              activeTab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {t === "ORG"
              ? "Organization Info"
              : t === "DEPT"
              ? "Departments"
              : "Roles"}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}

      {/* ========== ORGANIZATION INFO ========== */}
      {activeTab === "ORG" && (
        <div className="bg-white p-6 rounded shadow max-w-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              Organization Details
            </h2>

            {org && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {org && !editing && (
            <div className="space-y-2 text-sm">
              <p><b>Name:</b> {org.name}</p>
              <p><b>Phone:</b> {org.phone}</p>
              <p><b>City:</b> {org.city}</p>
              <p><b>State:</b> {org.state}</p>
              <p><b>Employee Prefix:</b> {org.emp_prefix}</p>
            </div>
          )}

          {/* CREATE / EDIT FORM */}
          {(!org || editing) && (
            <div className="space-y-3">
              <input
                name="name"
                placeholder="Company Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 w-full"
              />

              <input
                name="phone"
                placeholder="+91XXXXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 w-full"
              />

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="border p-2 w-full"
              />

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="border p-2 w-full"
              />

              <input
                name="emp_prefix"
                placeholder="EMP Prefix"
                value={form.emp_prefix}
                onChange={handleChange}
                className="border p-2 w-full"
              />

              <div className="flex gap-3">
                {!org ? (
                  <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Create Organization
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        loadOrganization();
                      }}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== DEPARTMENTS ========== */}
      {activeTab === "DEPT" && <DepartmentPage />}

      {/* ========== ROLES ========== */}
      {activeTab === "ROLE" && <RolePage />}
    </div>
  );
};

export default OrganizationPage;
