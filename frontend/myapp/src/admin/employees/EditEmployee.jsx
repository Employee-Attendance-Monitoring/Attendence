import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BASE_URL = "http://127.0.0.1:8000";

const Label = ({ text, required }) => (
  <label className="text-sm font-medium mb-1 block">
    {text} {required && <span className="text-red-600">*</span>}
  </label>
);

const EMPTY_BANK = {
  bank_name: "",
  account_number: "",
  ifsc_code: "",
};

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    employee_code: "",
    full_name: "",
    department: "",
    company_name: "",
    date_of_joining: "",
    photo: null,
    bank_detail: { ...EMPTY_BANK },
    family_members: [],
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}/`);
        const data = res.data;

        setFormData((prev) => ({
          ...prev,
          email: data.email_display || "",
          employee_code: data.employee_code || "",
          full_name: data.full_name || "",
          department: data.department || "",
          company_name: data.company_name || "",
          date_of_joining: data.date_of_joining || "",
          phone_number: res.data.phone_number || "", 

          // ✅ SAFE MERGE
          bank_detail: data.bank_detail
            ? { ...EMPTY_BANK, ...data.bank_detail }
            : { ...EMPTY_BANK },

          family_members: Array.isArray(data.family_members)
            ? data.family_members
            : [],
        }));

        // ✅ PHOTO PREVIEW
        if (data.photo) {
          setPhotoPreview(
            data.photo.startsWith("http")
              ? data.photo
              : `${BASE_URL}${data.photo}`
          );
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // ================= HANDLERS =================
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

      await api.put(`/employees/${id}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Employee updated successfully ✅");
      navigate("/admin/employees");
    } catch (err) {
      console.error(err.response?.data);
      alert("Failed to update employee ❌");
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl bg-white p-6 shadow rounded">
      <h1 className="text-xl font-bold mb-4">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Label text="Email" required />
        <input name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />

        <Label text="Employee Code" required />
        <input name="employee_code" value={formData.employee_code} onChange={handleChange} className="border p-2 w-full" />

        <Label text="Full Name" required />
        <input name="full_name" value={formData.full_name} onChange={handleChange} className="border p-2 w-full" />

        <Label text="Department" required />
        <input name="department" value={formData.department} onChange={handleChange} className="border p-2 w-full" />
        <Label text="Phone Number" />
<input
  name="phone_number"
  value={formData.phone_number}
  onChange={handleChange}
  className="border p-2 w-full"
  placeholder="e.g. 9876543210"
/>


        <Label text="Company Name" required />
        <input name="company_name" value={formData.company_name} onChange={handleChange} className="border p-2 w-full" />

        <Label text="Date of Joining" required />
        <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} className="border p-2 w-full" />

        {/* PHOTO */}
        <h2 className="font-semibold mt-6">Profile Photo</h2>
        <img src={photoPreview || "/default-avatar.png"} className="w-24 h-24 rounded-full border mb-2" />
        <input type="file" accept="image/*" onChange={handlePhotoChange} />

        {/* BANK */}
        <h2 className="font-semibold mt-6">Bank Details</h2>
        <input placeholder="Bank Name" className="border p-2 w-full"
          value={formData.bank_detail.bank_name}
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, bank_name: e.target.value },
            })
          }
        />
        <input placeholder="Account Number" className="border p-2 w-full"
          value={formData.bank_detail.account_number}
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, account_number: e.target.value },
            })
          }
        />
        <input placeholder="IFSC Code" className="border p-2 w-full"
          value={formData.bank_detail.ifsc_code}
          onChange={(e) =>
            setFormData({
              ...formData,
              bank_detail: { ...formData.bank_detail, ifsc_code: e.target.value },
            })
          }
        />

        {/* FAMILY */}
        <h2 className="font-semibold mt-6">Family Members</h2>
        {formData.family_members.map((m, i) => (
          <div key={i} className="border p-2 rounded">
            <input placeholder="Name" className="border p-2 w-full mb-1" value={m.name}
              onChange={(e) => {
                const f = [...formData.family_members];
                f[i].name = e.target.value;
                setFormData({ ...formData, family_members: f });
              }}
            />
            <input placeholder="Relationship" className="border p-2 w-full" value={m.relationship}
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

        <button type="button" className="text-blue-600"
          onClick={() =>
            setFormData({
              ...formData,
              family_members: [...formData.family_members, { name: "", relationship: "" }],
            })
          }
        >
          + Add Family Member
        </button>

        <button type="submit" className="bg-blue-600 text-white w-full py-2 mt-4">
          {submitting ? "Updating..." : "Update Employee"}
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
