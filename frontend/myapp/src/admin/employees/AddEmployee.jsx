import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Label = ({ text, required }) => (
  <label className="text-sm font-medium mb-1 block">
    {text} {required && <span className="text-red-600">*</span>}
  </label>
);

const AddEmployee = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    employee_code: "",
    full_name: "",
    department: "",
    company_name: "",
    date_of_joining: "",
    photo: null,
    phone_number: "",
    bank_detail: {
      bank_name: "",
      account_number: "",
      ifsc_code: "",
    },
    family_members: [],
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, photo: file });
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const payload = new FormData();

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
      console.error(err.response?.data);
      alert("Failed to create employee ❌");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 shadow rounded">
      <h1 className="text-xl font-bold mb-4">Add Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-semibold text-red-600">Required Details</h2>

        <Label text="Email" required />
        <input name="email" onChange={handleChange} className="border p-2 w-full" required />

        <Label text="Password" required />
        <input type="password" name="password" onChange={handleChange} className="border p-2 w-full" required />

        <Label text="Employee Code" required />
        <input name="employee_code" onChange={handleChange} className="border p-2 w-full" required />

        <Label text="Full Name" required />
        <input name="full_name" onChange={handleChange} className="border p-2 w-full" required />

        <Label text="Department" required />
        <input name="department" onChange={handleChange} className="border p-2 w-full" required />
        <Label text="Phone Number" />
        <input
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="e.g. 9876543210"
        />

        <Label text="Company Name" required />
        <input name="company_name" onChange={handleChange} className="border p-2 w-full" required />

        <Label text="Date of Joining" required />
        <input type="date" name="date_of_joining" onChange={handleChange} className="border p-2 w-full" required />

        <h2 className="font-semibold mt-6">Optional Details</h2>

        {/* PHOTO PREVIEW */}
        <div>
          <Label text="Profile Photo (Optional)" />

          <img
            src={photoPreview || "/default-avatar.png"}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border mb-2"
          />

          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <h3 className="font-semibold mt-4">Bank Details (Optional)</h3>

        <input
          placeholder="Bank Name"
          className="border p-2 w-full"
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, bank_name: e.target.value },
            })
          }
        />

        <input
          placeholder="Account Number"
          className="border p-2 w-full"
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, account_number: e.target.value },
            })
          }
        />

        <input
          placeholder="IFSC Code"
          className="border p-2 w-full"
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, ifsc_code: e.target.value },
            })
          }
        />

        <h3 className="font-semibold mt-4">Family Members (Optional)</h3>

        {formData.family_members.map((m, i) => (
          <div key={i} className="border p-2 rounded">
            <input
              placeholder="Name"
              className="border p-2 w-full mb-1"
              value={m.name}
              onChange={(e) => {
                const f = [...formData.family_members];
                f[i].name = e.target.value;
                setFormData({ ...formData, family_members: f });
              }}
            />
            <input
              placeholder="Relationship"
              className="border p-2 w-full"
              value={m.relationship}
              onChange={(e) => {
                const f = [...formData.family_members];
                f[i].relationship = e.target.value;
                setFormData({ ...formData, family_members: f });
              }}
            />
            <input
  placeholder="Phone Number"
  className="border p-2 w-full mb-1"
  value={m.phone_number || ""}
  onChange={(e) => {
    const f = [...formData.family_members];
    f[i].phone_number = e.target.value;
    setFormData({ ...formData, family_members: f });
  }}
/>

          </div>
        ))}

        <button
          type="button"
          className="text-blue-600"
          onClick={() =>
            setFormData({
              ...formData,
              family_members: [...formData.family_members, { name: "", relationship: "",phone_number: "" }],
            })
          }
        >
          + Add Family Member
        </button>

        <button type="submit" className="bg-blue-600 text-white w-full py-2">
          {submitting ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
