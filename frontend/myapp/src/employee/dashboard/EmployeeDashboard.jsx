import { useEffect, useState } from "react";
import { signIn, signOut, getTodayAttendance } from "../../api/attendanceApi";
import { getMyProfile } from "../../api/employeeApi";
import Loader from "../../components/Loader";

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, attendanceRes] = await Promise.all([
        getMyProfile(),
        getTodayAttendance(),
      ]);

      setProfile(profileRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const res = await signIn();
      setAttendance(res.data);
      setMessage("Signed in successfully");
    } catch (err) {
      alert(err.response?.data?.detail || "Already signed in");
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await signOut();
      setAttendance(res.data);
      setMessage("Signed out successfully");
    } catch (err) {
      alert(err.response?.data?.detail || "Already signed out");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Welcome, {profile?.full_name}</h2>
        <p className="text-gray-600">
          Employee Code: {profile?.employee_code}
        </p>
      </div>

      {/* Attendance Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Today Attendance</h3>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <p>
            <strong>Sign In:</strong>{" "}
            {attendance?.sign_in || "Not signed in"}
          </p>
          <p>
            <strong>Sign Out:</strong>{" "}
            {attendance?.sign_out || "Not signed out"}
          </p>
          <p>
            <strong>Working Hours:</strong>{" "}
            {attendance?.working_hours || "0"}
          </p>
          <p>
            <strong>Status:</strong> {attendance?.status || "Absent"}
          </p>
        </div>

        <div className="flex gap-4">
          {!attendance?.sign_in && (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Sign In
            </button>
          )}

          {attendance?.sign_in && !attendance?.sign_out && (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
        </div>

        {message && (
          <p className="mt-3 text-green-600 font-medium">{message}</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="My Profile" desc="View personal details" />
        <DashboardCard title="My Attendance" desc="Attendance history" />
        <DashboardCard title="Apply Leave" desc="Request leave" />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, desc }) => (
  <div className="bg-white shadow p-5 rounded-lg hover:shadow-lg transition">
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

export default EmployeeDashboard;
