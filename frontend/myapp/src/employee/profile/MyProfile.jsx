import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/employeeApi";
import Loader from "../../components/Loader";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!profile) return <p>No profile data</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      <div className="bg-white shadow rounded p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PHOTO */}
        <div className="flex flex-col items-center">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
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

        {/* BASIC INFO */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <ProfileItem label="Date of Joining" value={profile.date_of_joining} />
          <ProfileItem label="Department" value={profile.department} />
          <ProfileItem label="Company" value={profile.company_name} />
        </div>
      </div>

      {/* BANK DETAILS */}
      <div className="bg-white shadow rounded p-6 mt-6">
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
