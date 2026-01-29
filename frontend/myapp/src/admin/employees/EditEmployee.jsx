import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getDepartments, getRoles } from "../../api/organizationApi";
import { getBloodGroups } from "../../api/employeeApi";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
    date_of_joining: "",
    address: "",
    pancard_number: "",
    aadhaar_number: "",
    photo: null,
    bank_detail: { ...EMPTY_BANK },
    family_members: [],
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
          date_of_joining: d.date_of_joining || "",
          address: d.address || "",
          pancard_number: d.pancard_number || "",
          aadhaar_number: d.aadhaar_number || "",
          photo: null,
          bank_detail: d.bank_detail
            ? { ...EMPTY_BANK, ...d.bank_detail }
            : { ...EMPTY_BANK },
          family_members: d.family_members || [],
        });

        if (d.photo) {
          setPhotoPreview(
            d.photo.startsWith("http") ? d.photo : `${BASE_URL}${d.photo}`
          );
        }
      } catch {
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        // 🚫 DO NOT SEND THESE (CAUSES 400 ERROR)
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
    } catch {
      alert("Failed to update employee ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

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
              <input value={formData.employee_code} disabled className={`${inputClass} bg-gray-100`} />
            </div>

            <div>
              <Label text="Email" />
              <input value={formData.email} disabled className={`${inputClass} bg-gray-100`} />
            </div>

            <div>
              <Label text="Full Name" required />
              <input name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} required />
            </div>

            <div>
              <Label text="Gender" />
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <Label text="Department" required />
              <select name="department" value={formData.department} onChange={handleChange} className={inputClass} required>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <Label text="Role" required />
              <select name="role" value={formData.role} onChange={handleChange} className={inputClass} required>
                <option value="">Select Role</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <Label text="Grade" required />
              <select name="grade" value={formData.grade} onChange={handleChange} className={inputClass} required>
                <option value="">Select Grade</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <Label text="Blood Group" />
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                {bloodGroups.map((bg) => <option key={bg.value} value={bg.value}>{bg.label}</option>)}
              </select>
            </div>

            <div>
              <Label text="Phone Number" />
              <PhoneInput
                country="in"
                value={formData.phone_number.replace("+", "")}
                onChange={(v) => setFormData({ ...formData, phone_number: `+${v}` })}
                inputStyle={{ width: "100%" }}
              />
            </div>

            <div>
              <Label text="Company Name" />
              <input value={COMPANY_NAME} disabled className={`${inputClass} bg-gray-100`} />
            </div>

            <div>
              <Label text="Date of Joining" required />
              <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} className={inputClass} required />
            </div>
          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <textarea name="address" rows="3" value={formData.address} onChange={handleChange} className={inputClass} />
        </section>

        {/* BANK DETAILS */}
        <section>
          <h2 className="font-semibold mb-3">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["bank_name", "account_number", "ifsc_code"].map((f) => (
              <input
                key={f}
                className={inputClass}
                placeholder={f.replace("_", " ").toUpperCase()}
                value={formData.bank_detail[f]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_detail: { ...formData.bank_detail, [f]: e.target.value },
                  })
                }
              />
            ))}
          </div>
        </section>

        {/* FAMILY MEMBERS */}
        <section>
          <h2 className="font-semibold mb-3">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {["name", "relationship", "phone_number"].map((f) => (
                <input
                  key={f}
                  className={inputClass}
                  placeholder={f.replace("_", " ").toUpperCase()}
                  value={m[f] || ""}
                  onChange={(e) => {
                    const arr = [...formData.family_members];
                    arr[i][f] = e.target.value;
                    setFormData({ ...formData, family_members: arr });
                  }}
                />
              ))}
            </div>
          ))}

          <button
            type="button"
            className="text-blue-600 font-medium"
            onClick={() =>
              setFormData({
                ...formData,
                family_members: [...formData.family_members, { name: "", relationship: "", phone_number: "" }],
              })
            }
          >
            + Add Family Member
          </button>
        </section>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg">
          {submitting ? "Updating..." : "Update Employee"}
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
