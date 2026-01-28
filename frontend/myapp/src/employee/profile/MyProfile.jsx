import { useEffect, useState } from "react";
import { getMyProfile, changePassword } from "../../api/employeeApi";
import Loader from "../../components/Loader";

const BASE_URL = "http://127.0.0.1:8000";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        const data = res.data;

        // normalize photo URL
        if (data.photo && !data.photo.startsWith("http")) {
          data.photo = `${BASE_URL}${data.photo}`;
        }

        setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

      // logout after password change
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <p>No profile data</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      {/* ================= BASIC PROFILE ================= */}
      <div className="bg-white shadow rounded p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PHOTO */}
        <div className="flex flex-col items-center">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center">
              No Photo
            </div>
          )}

          <h3 className="mt-4 font-semibold text-lg">
            {profile.full_name}
          </h3>
          <p className="text-sm text-gray-600">
            {profile.employee_code}
          </p>
        </div>

        {/* INFO */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileItem label="Email" value={profile.email_display} />
          <ProfileItem label="Department" value={profile.department} />
          <ProfileItem label="Role" value={profile.role} />
          <ProfileItem label="Grade" value={profile.grade} />
          <ProfileItem label="Company" value={profile.company_name} />
          <ProfileItem label="Phone" value={profile.phone_number} />
          <ProfileItem label="Date of Joining" value={profile.date_of_joining} />
          <ProfileItem label="Gender" value={profile.gender} />
        </div>
      </div>

      {/* ================= ID PROOF ================= */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="font-semibold mb-4">ID Proof</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileItem label="PAN Card" value={profile.pancard_number} />
          <ProfileItem label="Aadhaar Number" value={profile.aadhaar_number} />
        </div>
      </div>

      {/* ================= BANK DETAILS ================= */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="font-semibold mb-4">Bank Details</h3>
        {profile.bank_detail ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProfileItem
              label="Bank Name"
              value={profile.bank_detail.bank_name}
            />
            <ProfileItem
              label="Account Number"
              value={profile.bank_detail.account_number}
            />
            <ProfileItem
              label="IFSC Code"
              value={profile.bank_detail.ifsc_code}
            />
          </div>
        ) : (
          <p className="text-gray-500">No bank details added</p>
        )}
      </div>

      {/* ================= FAMILY MEMBERS ================= */}
      <div className="bg-white shadow rounded p-6">
        <h3 className="font-semibold mb-4">Family Members</h3>

        {profile.family_members?.length > 0 ? (
          <div className="space-y-3">
            {profile.family_members.map((m, i) => (
              <div
                key={i}
                className="border p-3 rounded grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <ProfileItem label="Name" value={m.name} />
                <ProfileItem label="Relationship" value={m.relationship} />
                <ProfileItem label="Phone" value={m.phone_number} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No family members added</p>
        )}
      </div>

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="bg-white shadow rounded p-6 max-w-md">
        <h3 className="font-semibold mb-4">Change Password</h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* OLD PASSWORD */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Old Password"
              className="border rounded px-3 py-2 w-full"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <span
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-2.5 cursor-pointer"
            >
              👁
            </span>
          </div>

          {/* NEW PASSWORD */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              className="border rounded px-3 py-2 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 cursor-pointer"
            >
              👁
            </span>
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

const ProfileItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

export default MyProfile;
