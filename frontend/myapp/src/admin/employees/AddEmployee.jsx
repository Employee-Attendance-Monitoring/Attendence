import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const COMPANY_NAME = "Quandatum Analytics";

const Label = ({ text, required }) => (
  <label className="text-sm font-medium text-gray-700 mb-1 block">
    {text} {required && <span className="text-red-600">*</span>}
  </label>
);

const inputClass =
  "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    employee_code: "",
    full_name: "",
    department: "",
    date_of_joining: "",
    phone_number: "",
    pancard_number: "",
    aadhaar_number: "",
    photo: null,
    bank_detail: {
      bank_name: "",
      account_number: "",
      ifsc_code: "",
    },
    family_members: [],
  });

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, photo: file });
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family_members: [
        ...formData.family_members,
        { name: "", relationship: "", phone_number: "" },
      ],
    });
  };

  const updateFamilyMember = (index, field, value) => {
    const updated = [...formData.family_members];
    updated[index][field] = value;
    setFormData({ ...formData, family_members: updated });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const payload = new FormData();

      payload.append("company_name", COMPANY_NAME);

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "bank_detail" || key === "family_members") {
          payload.append(key, JSON.stringify(value));
        } else if (key === "photo") {
          if (value) payload.append("photo", value);
        } else {
          payload.append(key, value);
        }
      });

      await api.post("/employees/create/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Employee created successfully ✅");
      navigate("/admin/employees");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.detail ||
          "Failed to create employee ❌"
      );
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* BASIC DETAILS */}
        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label text="Email" required />
              <input
                name="email"
                type="email"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Password" required />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                >
                  👁
                </span>
              </div>
            </div>

            <div>
              <Label text="Employee Code" required />
              <input
                name="employee_code"
                placeholder="EMP001"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Full Name" required />
              <input
                name="full_name"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Department" required />
              <input
                name="department"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Phone Number" />
              <input
                name="phone_number"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <Label text="Company Name" />
              <input
                value={COMPANY_NAME}
                disabled
                className={inputClass + " bg-gray-100"}
              />
            </div>

            <div>
              <Label text="Date of Joining" required />
              <input
                type="date"
                name="date_of_joining"
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>
        </section>

        {/* PHOTO */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <img
              src={photoPreview || "/default-avatar.png"}
              className="w-24 h-24 rounded-full border object-cover"
              alt="Preview"
            />
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </section>

        {/* ID PROOF */}
        <section>
          <h2 className="text-lg font-semibold mb-4">ID Proof</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="pancard_number"
              onChange={handleChange}
              className={inputClass + " uppercase"}
              placeholder="PAN Card Number"
            />
            <input
              name="aadhaar_number"
              onChange={handleChange}
              className={inputClass}
              placeholder="Aadhaar Number"
              maxLength={12}
            />
          </div>
        </section>

        {/* BANK DETAILS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Bank Name"
              className={inputClass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bank_detail: {
                    ...formData.bank_detail,
                    bank_name: e.target.value,
                  },
                })
              }
            />
            <input
              placeholder="Account Number"
              className={inputClass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bank_detail: {
                    ...formData.bank_detail,
                    account_number: e.target.value,
                  },
                })
              }
            />
            <input
              placeholder="IFSC Code"
              className={inputClass}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bank_detail: {
                    ...formData.bank_detail,
                    ifsc_code: e.target.value,
                  },
                })
              }
            />
          </div>
        </section>

        {/* FAMILY MEMBERS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3"
            >
              <input
                placeholder="Name"
                className={inputClass}
                value={m.name}
                onChange={(e) =>
                  updateFamilyMember(i, "name", e.target.value)
                }
              />
              <input
                placeholder="Relationship"
                className={inputClass}
                value={m.relationship}
                onChange={(e) =>
                  updateFamilyMember(i, "relationship", e.target.value)
                }
              />
              <input
                placeholder="Phone Number"
                className={inputClass}
                value={m.phone_number}
                onChange={(e) =>
                  updateFamilyMember(i, "phone_number", e.target.value)
                }
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addFamilyMember}
            className="text-blue-600 font-medium"
          >
            + Add Family Member
          </button>
        </section>

        {/* SUBMIT */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
