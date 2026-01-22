import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const COMPANY_NAME = "Quandatum Analytics";
const BASE_URL = "http://127.0.0.1:8000";

const Label = ({ text, required }) => (
  <label className="text-sm font-medium text-gray-700 mb-1 block">
    {text} {required && <span className="text-red-600">*</span>}
  </label>
);

const inputClass =
  "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

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
    employee_code: "",
    email: "",
    full_name: "",
    department: "",
    phone_number: "",
    date_of_joining: "",
    pancard_number: "",
    aadhaar_number: "",
    photo: null,
    bank_detail: { ...EMPTY_BANK },
    family_members: [],
  });

  /* ================= FETCH EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}/`);
        const data = res.data;

        setFormData({
          employee_code: data.employee_code || "",
          email: data.email_display || "",
          full_name: data.full_name || "",
          department: data.department || "",
          phone_number: data.phone_number || "",
          date_of_joining: data.date_of_joining || "",
          pancard_number: data.pancard_number || "",
          aadhaar_number: data.aadhaar_number || "",
          photo: null,
          bank_detail: data.bank_detail
            ? { ...EMPTY_BANK, ...data.bank_detail }
            : { ...EMPTY_BANK },
          family_members: Array.isArray(data.family_members)
            ? data.family_members
            : [],
        });

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

  /* ================= HANDLERS ================= */
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

      await api.put(`/employees/${id}/`, payload);

      alert("Employee updated successfully ✅");
      navigate("/admin/employees");
    } catch (err) {
      console.error(err);
      alert("Failed to update employee ❌");
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ================= BASIC DETAILS ================= */}
        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label text="Employee Code" />
              <input
                value={formData.employee_code}
                disabled
                className={`${inputClass} bg-gray-100 font-semibold`}
              />
            </div>

            <div>
              <Label text="Email" />
              <input
                value={formData.email}
                disabled
                className={`${inputClass} bg-gray-100`}
              />
            </div>

            <div>
              <Label text="Full Name" required />
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Department" required />
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <Label text="Phone Number" />
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <Label text="Company Name" />
              <input
                value={COMPANY_NAME}
                disabled
                className={`${inputClass} bg-gray-100`}
              />
            </div>

            <div>
              <Label text="Date of Joining" required />
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

          </div>
        </section>

        {/* ================= PHOTO ================= */}
        <section>
          <h2 className="font-semibold mb-3">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <img
              src={photoPreview || "/default-avatar.png"}
              className="w-24 h-24 rounded-full border object-cover"
              alt="Preview"
            />
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </section>

        {/* ================= ID PROOF ================= */}
        <section>
          <h2 className="font-semibold mb-3">ID Proof</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="pancard_number"
              value={formData.pancard_number}
              onChange={handleChange}
              className={`${inputClass} uppercase`}
              placeholder="PAN Card Number"
            />
            <input
              name="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={handleChange}
              className={inputClass}
              placeholder="Aadhaar Number"
              maxLength={12}
            />
          </div>
        </section>

        {/* ================= BANK DETAILS ================= */}
        <section>
          <h2 className="font-semibold mb-3">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Bank Name"
              className={inputClass}
              value={formData.bank_detail.bank_name}
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
              value={formData.bank_detail.account_number}
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
              value={formData.bank_detail.ifsc_code}
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

        {/* ================= FAMILY MEMBERS ================= */}
        <section>
          <h2 className="font-semibold mb-3">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3"
            >
              <input
                placeholder="Name"
                className={inputClass}
                value={m.name}
                onChange={(e) => {
                  const f = [...formData.family_members];
                  f[i].name = e.target.value;
                  setFormData({ ...formData, family_members: f });
                }}
              />
              <input
                placeholder="Relationship"
                className={inputClass}
                value={m.relationship}
                onChange={(e) => {
                  const f = [...formData.family_members];
                  f[i].relationship = e.target.value;
                  setFormData({ ...formData, family_members: f });
                }}
              />
              <input
                placeholder="Phone Number"
                className={inputClass}
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
            className="text-blue-600 font-medium"
            onClick={() =>
              setFormData({
                ...formData,
                family_members: [
                  ...formData.family_members,
                  { name: "", relationship: "", phone_number: "" },
                ],
              })
            }
          >
            + Add Family Member
          </button>
        </section>

        {/* ================= SUBMIT ================= */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg"
        >
          {submitting ? "Updating..." : "Update Employee"}
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
