import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getDepartments, getRoles } from "../../api/organizationApi";
import { getBloodGroups } from "../../api/employeeApi";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const IS_EDIT_MODE = true;
const COMPANY_NAME = "Quandatum Analytics";
const BASE_URL = "http://127.0.0.1:8000";

const GRADES = ["Senior", "Junior", "Intern"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

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

const EMPTY_FAMILY = {
  name: "",
  relationship: "",
  phone_number: "",
};

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);

  const [formData, setFormData] = useState({
    employee_code: "",
    email: "",
    full_name: "",
    gender: "",
    department: "",
    role: "",
    grade: "",
    blood_group: "",
    phone_number: "",
    date_of_birth: "",
    date_of_joining: "",
    pancard_number: "",
    aadhaar_number: "",
    photo: null,

    current_address: "",
    permanent_address: "",

    bank_detail: { ...EMPTY_BANK },

    family_members: [{ ...EMPTY_FAMILY }],
  });

  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data || []));
    getRoles().then((res) => setRoles(res.data || []));
    getBloodGroups().then((res) => setBloodGroups(res.data || []));
  }, []);

  /* ================= FETCH EMPLOYEE ================= */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}/`);
        const d = res.data;

        setFormData({
          employee_code: d.employee_code || "",
          email: d.email_display || "",
          full_name: d.full_name || "",
          gender: d.gender || "",
          department: d.department || "",
          role: d.role || "",
          grade: d.grade || "",
          blood_group: d.blood_group || "",
          phone_number: d.phone_number || "",
          date_of_birth: d.date_of_birth || "",
          date_of_joining: d.date_of_joining || "",
          pancard_number: d.pancard_number || "",
          aadhaar_number: d.aadhaar_number || "",
          photo: null,

          current_address: d.current_address || "",
          permanent_address: d.permanent_address || "",

          bank_detail: d.bank_detail
            ? { ...EMPTY_BANK, ...d.bank_detail }
            : { ...EMPTY_BANK },

          family_members:
            d.family_members?.length > 0
              ? d.family_members
              : [{ ...EMPTY_FAMILY }],
        });

        if (d.photo) {
          setPhotoPreview(
            d.photo.startsWith("http") ? d.photo : `${BASE_URL}${d.photo}`
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

  const updateFamilyMember = (index, field, value) => {
    const updated = [...formData.family_members];
    updated[index][field] = value;
    setFormData({ ...formData, family_members: updated });
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      family_members: [...formData.family_members, { ...EMPTY_FAMILY }],
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "email" || key === "employee_code") return;

        if (key === "bank_detail" || key === "family_members") {
          payload.append(key, JSON.stringify(value));
        } else if (key === "photo") {
          if (value) payload.append("photo", value);
        } else {
          payload.append(key, value ?? "");
        }
      });

      await api.put(`/employees/${id}/`, payload);
      alert("Employee updated successfully ✅");
      navigate("/admin/employees");
    } catch (err) {
  console.error("UPDATE ERROR:", err.response?.data);

  alert(
    JSON.stringify(
      err.response?.data || "Unknown error",
      null,
      2
    )
  );
}


    finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* BASIC DETAILS */}
        <section>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label text="Employee Code" />
              <input value={formData.employee_code} disabled className={inputClass + " bg-gray-100"} />
            </div>

            <div>
              <Label text="Email" />
              <input value={formData.email} disabled className={inputClass + " bg-gray-100"} />
            </div>

            <div>
              <Label text="Full Name" required />
<input
  name="full_name"
  value={formData.full_name}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
/>
              </div>

            <div>
              <Label text="Gender" />
              <select
  name="gender"
  value={formData.gender || ""}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
>
  <option value="">Select Gender</option>
  {GENDERS.map((g) => (
    <option key={g} value={g}>
      {g}
    </option>
  ))}
</select>


            </div>

            <div>
              <Label text="Department" required />
    <select
  name="department"
  value={formData.department}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
>

  <option value="">Select Department</option>
  {departments.map((d) => (
    <option key={d.id} value={d.name}>
      {d.name}
    </option>
  ))}
</select>

            </div>

            <div>
              <Label text="Role" required />
              <select
  name="role"
  value={formData.role}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
>

  <option value="">Select Role</option>
  {roles.map((r) => (
    <option key={r.id} value={r.name}>
      {r.name}
    </option>
  ))}
</select>

            </div>

            <div>
              <Label text="Grade" required />
              <select
  name="grade"
  value={formData.grade}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
>

  <option value="">Select Grade</option>
  {GRADES.map((g) => (
    <option key={g} value={g}>
      {g}
    </option>
  ))}
</select>

            </div>

            <div>
              <Label text="Phone Number" />
              <PhoneInput country="in" value={(formData.phone_number || "").replace("+", "")} onChange={(v) =>
    setFormData({ ...formData, phone_number: `+${v}` }) } inputStyle={{ width: "100%" }} />
            </div>

            <div>
              <Label text="Blood Group" />
           <select
  name="blood_group"
  value={formData.blood_group || ""}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
>
  <option value="">Select Blood Group</option>
  {bloodGroups.map((bg) => (
    <option key={bg.value} value={bg.value}>
      {bg.label}
    </option>
  ))}
</select>


            </div>

            <div>
              <Label text="Company Name" />
              <input value={COMPANY_NAME} disabled className={inputClass + " bg-gray-100"} />
            </div>

            <div>
              <Label text="Date of Birth" />
<input
  type="date"
  name="date_of_birth"
  value={formData.date_of_birth}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
/>
            </div>

            <div>
              <Label text="Date of Joining" required />
<input
  type="date"
  name="date_of_joining"
  value={formData.date_of_joining}
  disabled
  className={inputClass + " bg-gray-100 cursor-not-allowed"}
/>
            </div>
          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea name="current_address" value={formData.current_address} onChange={handleChange} className={inputClass} placeholder="Current Address" />
            <textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} className={inputClass} placeholder="Permanent Address" />
          </div>
        </section>

        {/* PHOTO */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <img src={photoPreview || "/default-avatar.png"} className="w-24 h-24 rounded-full border object-cover" alt="Preview" />
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </section>

        {/* BANK DETAILS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Bank Details <span className="text-sm text-gray-500">(Optional)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className={inputClass} placeholder="Bank Name"
              value={formData.bank_detail.bank_name}
              onChange={(e) => setFormData({
                ...formData,
                bank_detail: { ...formData.bank_detail, bank_name: e.target.value },
              })}
            />
            <input className={inputClass} placeholder="Account Number"
              value={formData.bank_detail.account_number}
              onChange={(e) => setFormData({
                ...formData,
                bank_detail: { ...formData.bank_detail, account_number: e.target.value },
              })}
            />
            <input className={inputClass} placeholder="IFSC Code"
              value={formData.bank_detail.ifsc_code}
              onChange={(e) => setFormData({
                ...formData,
                bank_detail: { ...formData.bank_detail, ifsc_code: e.target.value },
              })}
            />
          </div>
        </section>

        {/* ID PROOF */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            ID Proof <span className="text-sm text-gray-500">(Optional)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="pancard_number" value={formData.pancard_number} onChange={handleChange} className={inputClass} placeholder="PAN Number" />
            <input name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} className={inputClass} placeholder="Aadhaar Number" />
          </div>
        </section>

        {/* FAMILY MEMBERS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input className={inputClass} placeholder="Name" value={m.name}
                onChange={(e) => updateFamilyMember(i, "name", e.target.value)} />
              <input className={inputClass} placeholder="Relationship" value={m.relationship}
                onChange={(e) => updateFamilyMember(i, "relationship", e.target.value)} />
              <PhoneInput country="in" value={m.phone_number.replace("+", "")}
                onChange={(v) => updateFamilyMember(i, "phone_number", `+${v}`)}
                inputStyle={{ width: "100%" }} />
            </div>
          ))}

          <button type="button" onClick={addFamilyMember} className="text-blue-600 font-medium">
            + Add Family Member
          </button>
        </section>

        <button type="submit" disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg">
          {submitting ? "Updating..." : "Update Employee"}
        </button>

      </form>
    </div>
  );
};

export default EditEmployee;
  