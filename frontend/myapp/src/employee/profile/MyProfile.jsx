import { useEffect, useState } from "react";
import { getMyProfile, changePassword } from "../../api/employeeApi";
import Loader from "../../components/Loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/* ================= SMALL UI COMPONENT ================= */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b py-2 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800">{value || "-"}</span>
  </div>
);

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatDateDMY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};


  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    getMyProfile()
      .then((res) => {
        const data = res.data;

        // normalize photo
        if (data.photo && !data.photo.startsWith("http")) {
          data.photo = `${BASE_URL}${data.photo}`;
        }

        setProfile(data);
      })
      .catch(() => alert("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      alert("Both password fields are required");
      return;
    }

    try {
      setSubmitting(true);

      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      alert("Password changed successfully. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <p>No profile data</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
        <img
          src={profile.photo || "/default-avatar.png"}
          className="w-36 h-36 rounded-full object-cover border"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <p className="text-gray-500">{profile.email_display}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Emp Code: {profile.employee_code}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {profile.department}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BASIC */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">👤 Basic Information</h2>
          <InfoRow label="Phone" value={profile.phone_number} />
          <InfoRow label="Gender" value={profile.gender} />
          <InfoRow label="Blood Group" value={profile.blood_group} />
          <InfoRow label="Date of Birth" value={formatDateDMY(profile.date_of_birth)} />
        </div>

        {/* WORK */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">🏢 Work Information</h2>
          <InfoRow label="Company" value={profile.company_name} />
          <InfoRow label="Department" value={profile.department} />
          <InfoRow label="Role" value={profile.role} />
          <InfoRow label="Grade" value={profile.grade} />
          <InfoRow label="Date of Joining" value={formatDateDMY(profile.date_of_joining)} />
        </div>

        {/* ADDRESS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">📍 Address</h2>
          <InfoRow label="Current Address" value={profile.current_address} />
          <InfoRow label="Permanent Address" value={profile.permanent_address} />
        </div>

        {/* BANK */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">🏦 Bank Details</h2>
          <InfoRow label="Bank Name" value={profile.bank_detail?.bank_name} />
          <InfoRow label="Account Number" value={profile.bank_detail?.account_number} />
          <InfoRow label="IFSC Code" value={profile.bank_detail?.ifsc_code} />
        </div>

        {/* ID */}
        <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">🪪 ID Proof</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoRow label="PAN Number" value={profile.pancard_number} />
            <InfoRow label="Aadhaar Number" value={profile.aadhaar_number} />
          </div>
        </div>

      </div>

      {/* ================= FAMILY ================= */}
      {profile.family_members?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">👨‍👩‍👧 Family Members</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {profile.family_members.map((m, i) => (
              <div key={i} className="border rounded p-4 bg-gray-50">
                <p className="font-semibold">{m.name}</p>
                <p>{m.relationship}</p>
                <p className="text-sm text-gray-500">
                  📞 {m.phone_number || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="bg-white rounded-xl shadow p-6 max-w-md">
        <h2 className="font-semibold mb-4">🔐 Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
  <input
    type={showOld ? "text" : "password"}
    placeholder="Old Password"
    className="border rounded px-3 py-2 w-full pr-10"
    value={oldPassword}
    onChange={(e) => setOldPassword(e.target.value)}
  />
  </div>

  <div className="relative">
  <input
    type={showNew ? "text" : "password"}
    placeholder="New Password"
    className="border rounded px-3 py-2 w-full pr-10"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowNew(!showNew)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  >
    {showNew ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
