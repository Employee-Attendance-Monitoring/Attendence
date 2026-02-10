import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getDepartments, getRoles } from "../../api/organizationApi";
import { getBloodGroups } from "../../api/employeeApi";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const COMPANY_NAME = "Quandatum Analytics";
const GRADES = ["Senior", "Junior", "Intern"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

const inputClass =
  "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

const Label = ({ text, required }) => (
  <label className="text-sm font-medium text-gray-700 mb-1 block">
    {text} {required && <span className="text-red-600">*</span>}
  </label>
);

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    department: "",
    role: "",
    grade: "",
    gender: "",
    blood_group: "",
    date_of_birth: "",
    date_of_joining: "",
    phone_number: "",
    pancard_number: "",
    aadhaar_number: "",
    current_address: "",
    permanent_address: "",
    photo: null,

    bank_detail: {
      bank_name: "",
      account_number: "",
      ifsc_code: "",
    },

    family_members: [
      { name: "", relationship: "", phone_number: "" },
    ],
  });

  /* ================= LOAD DROPDOWNS ================= */
  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data || []));
    getRoles().then((res) => setRoles(res.data || []));
    getBloodGroups().then((res) => setBloodGroups(res.data || []));
  }, []);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((p) => ({ ...p, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const addFamilyMember = () => {
    setFormData((p) => ({
      ...p,
      family_members: [
        ...p.family_members,
        { name: "", relationship: "", phone_number: "" },
      ],
    }));
  };

  const updateFamilyMember = (i, field, value) => {
    const updated = [...formData.family_members];
    updated[i][field] = value;
    setFormData((p) => ({ ...p, family_members: updated }));
  };

  /* ================= SUBMIT ================= */
const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  try {
    setLoading(true);

    const payload = new FormData();

    payload.append("email", formData.email);
    payload.append("full_name", formData.full_name);
    payload.append("department", formData.department); // ✅ STRING
    payload.append("role", formData.role);             // ✅ STRING
    payload.append("grade", formData.grade);
    payload.append("gender", formData.gender);
    payload.append("date_of_joining", formData.date_of_joining);

    if (formData.date_of_birth)
      payload.append("date_of_birth", formData.date_of_birth);

    payload.append("phone_number", formData.phone_number);
    payload.append("blood_group", formData.blood_group);
    payload.append("pancard_number", formData.pancard_number);
    payload.append("aadhaar_number", formData.aadhaar_number);
    payload.append("current_address", formData.current_address);
    payload.append("permanent_address", formData.permanent_address);

    if (formData.photo)
      payload.append("photo", formData.photo);

    // ✅ FIXED KEYS
    payload.append(
      "bank_detail_input",
      JSON.stringify(formData.bank_detail)
    );

    const validFamily = formData.family_members.filter(
      (m) => m.name || m.relationship || m.phone_number
    );

    payload.append(
      "family_members_input",
      JSON.stringify(validFamily)
    );

    await api.post("/employees/create/", payload);

    alert("Employee created successfully ✅");
    navigate("/admin/employees");
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error.response?.data);
    alert(JSON.stringify(error.response?.data, null, 2));
  } finally {
    setLoading(false);
  }
};


  /* ================= UI ================= */
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* BASIC DETAILS */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-blue-600">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label text="Email" required />
              <input name="email" type="email" required onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <Label text="Full Name" required />
              <input name="full_name" required onChange={handleChange} className={inputClass} />
            </div>
            <div>
  <Label text="Company Name" />
  <input
    value={COMPANY_NAME}
    disabled
    className={inputClass + " bg-gray-100 cursor-not-allowed"}
  />
</div>

            <div>
              <Label text="Gender" />
              <select name="gender" onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <Label text="Date of Birth" />
              <input type="date" name="date_of_birth" onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <Label text="Department" required />
              <select
  name="department"
  required
  onChange={handleChange}
  className={inputClass}
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
  required
  onChange={handleChange}
  className={inputClass}
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
              <select name="grade" required onChange={handleChange} className={inputClass}>
                <option value="">Select Grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <Label text="Phone Number" />
              <PhoneInput
                country="in"
                value={formData.phone_number.replace("+", "")}
                onChange={(v) =>
                  setFormData((p) => ({ ...p, phone_number: `+${v}` }))
                }
                inputStyle={{ width: "100%" }}
              />
            </div>

            <div>
              <Label text="Blood Group" />
              <select name="blood_group" onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg.value} value={bg.value}>{bg.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label text="Date of Joining" required />
              <input type="date" name="date_of_joining" required onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea name="current_address" placeholder="Current Address" onChange={handleChange} className={inputClass} />
            <textarea name="permanent_address" placeholder="Permanent Address" onChange={handleChange} className={inputClass} />
          </div>
        </section>

        {/* PHOTO */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex gap-6 items-center">
            <img
              src={photoPreview || "/default-avatar.png"}
              alt="Preview"
              className="w-24 h-24 rounded-full border object-cover"
            />
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
        </section>

        {/* BANK */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Bank Name" className={inputClass}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  bank_detail: { ...p.bank_detail, bank_name: e.target.value },
                }))
              }
            />
            <input placeholder="Account Number" className={inputClass}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  bank_detail: { ...p.bank_detail, account_number: e.target.value },
                }))
              }
            />
            <input placeholder="IFSC Code" className={inputClass}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  bank_detail: { ...p.bank_detail, ifsc_code: e.target.value },
                }))
              }
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

        {/* FAMILY */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input className={inputClass} placeholder="Name"
                value={m.name}
                onChange={(e) => updateFamilyMember(i, "name", e.target.value)}
              />
              <input className={inputClass} placeholder="Relationship"
                value={m.relationship}
                onChange={(e) => updateFamilyMember(i, "relationship", e.target.value)}
              />
              <PhoneInput
                country="in"
                value={m.phone_number.replace("+", "")}
                onChange={(v) =>
                  updateFamilyMember(i, "phone_number", `+${v}`)
                }
                inputStyle={{ width: "100%" }}
              />
            </div>
          ))}

          <button type="button" onClick={addFamilyMember} className="text-blue-600 font-medium">
            + Add Family Member
          </button>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg"
        >
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
