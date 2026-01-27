import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  getDepartments,
  getRoles,
} from "../../api/organizationApi";

const COMPANY_NAME = "Quandatum Analytics";
const GRADES = ["Senior", "Junior", "Intern"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

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

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    // employee_code: "",
    full_name: "",
    department: "",
    role: "",
    grade: "",

    gender: "",
    date_of_birth: "",

    address: "",
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

  /* ================= AUTO EMPLOYEE CODE ================= */
  

  /* ================= LOAD DEPARTMENT & ROLE ================= */
  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));

    getRoles()
      .then((res) => setRoles(res.data || []))
      .catch(() => setRoles([]));
  }, []);

  /* ================= HELPERS ================= */
  const isValidIndianPhone = (phone) =>
    /^(\+91)?[6-9]\d{9}$/.test(phone);

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

  if (formData.phone_number && !isValidIndianPhone(formData.phone_number)) {
    alert("Enter valid Indian phone number (+91XXXXXXXXXX)");
    return;
  }

  try {
    setSubmitting(true);

    const payload = new FormData();

    // REQUIRED field from backend
    payload.append("company_name", COMPANY_NAME);

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "bank_detail" || key === "family_members") {
        payload.append(key, JSON.stringify(value));
      } else if (key === "photo") {
        if (value) payload.append("photo", value);
      } else {
        payload.append(key, value ?? "");
      }
    });

    // ✅ DO NOT set headers manually
    await api.post("/employees/create/", payload);

    alert("Employee created successfully ✅");
    navigate("/admin/employees");

  } catch (err) {
    console.error("AXIOS ERROR:", err);

    if (err.response) {
      console.error("DJANGO ERROR:", err.response.data);
      alert(
        typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data, null, 2)
      );
    } else {
      alert("Server not reachable");
    }

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
              <input name="email" type="email" onChange={handleChange} className={inputClass} required />
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
                  className="absolute right-3 top-2.5 cursor-pointer"
                >
                  👁
                </span>
              </div>
            </div>

            {/* <div>
              <Label text="Employee ID" />
              <input value={formData.employee_code} disabled className={inputClass + " bg-gray-100"} />
            </div> */}

            <div>
              <Label text="Full Name" required />
              <input name="full_name" onChange={handleChange} className={inputClass} required />
            </div>

            {/* GENDER */}
            <div>
              <Label text="Gender" />
              <select name="gender" onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* DOB */}
            <div>
              <Label text="Date of Birth" />
              <input
                type="date"
                name="date_of_birth"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* DEPARTMENT */}
            <div>
              <Label text="Department" required />
              <select name="department" onChange={handleChange} className={inputClass} required>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* ROLE */}
            <div>
              <Label text="Role" required />
              <select name="role" onChange={handleChange} className={inputClass} required>
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* GRADE */}
            <div>
              <Label text="Grade" required />
              <select name="grade" onChange={handleChange} className={inputClass} required>
                <option value="">Select Grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <Label text="Phone Number" />
              <input
                name="phone_number"
                placeholder="+91XXXXXXXXXX"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <Label text="Company Name" />
              <input value={COMPANY_NAME} disabled className={inputClass + " bg-gray-100"} />
            </div>

            <div>
              <Label text="Date of Joining" required />
              <input type="date" name="date_of_joining" onChange={handleChange} className={inputClass} required />
            </div>

          </div>
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <textarea
            name="address"
            rows="3"
            onChange={handleChange}
            className={inputClass}
            placeholder="Employee address"
          />
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

        {/* FAMILY MEMBERS */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Family Members</h2>

          {formData.family_members.map((m, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input className={inputClass} placeholder="Name" value={m.name}
                onChange={(e) => updateFamilyMember(i, "name", e.target.value)} />
              <input className={inputClass} placeholder="Relationship" value={m.relationship}
                onChange={(e) => updateFamilyMember(i, "relationship", e.target.value)} />
              <input className={inputClass} placeholder="+91XXXXXXXXXX" value={m.phone_number}
                onChange={(e) => updateFamilyMember(i, "phone_number", e.target.value)} />
            </div>
          ))}

          <button type="button" onClick={addFamilyMember} className="text-blue-600 font-medium">
            + Add Family Member
          </button>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded text-lg"
        >
          {submitting ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployee;
