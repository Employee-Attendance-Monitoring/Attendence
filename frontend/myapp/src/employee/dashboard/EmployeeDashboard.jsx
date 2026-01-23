import { useEffect, useState } from "react";
import {
  employeeSignIn,
  employeeSignOut,
  getMyAttendanceHistory,
} from "../../api/attendanceApi";
import {
  getMyLeaves,
  getMyLeaveBalance,
} from "../../api/leaveApi";
import Loader from "../../components/Loader";
import { useNavigate, useLocation } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [leaveSummary, setLeaveSummary] = useState({
    total: 0,
    taken: 0,
    balance: 0,
  });

  /* ================= LOAD ATTENDANCE ================= */
  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendanceHistory();
      const data = res.data || [];
      setRecords(data);

      const todayDate = new Date().toISOString().slice(0, 10);
      const todayRecord = data.find((r) => r.date === todayDate);
      setToday(todayRecord || null);

      if (todayRecord?.sign_in && !todayRecord?.sign_out) {
        setWorking(true);
        setSeconds(
          Math.floor((Date.now() - new Date(todayRecord.sign_in)) / 1000)
        );
      } else if (todayRecord?.sign_in && todayRecord?.sign_out) {
        setWorking(false);
        setSeconds(
          Math.floor(
            (new Date(todayRecord.sign_out) -
              new Date(todayRecord.sign_in)) /
              1000
          )
        );
      } else {
        setWorking(false);
        setSeconds(0);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD LEAVE DATA ================= */
  const loadLeaveSummary = async () => {
    const [leaveRes, balanceRes] = await Promise.all([
      getMyLeaves(),
      getMyLeaveBalance(),
    ]);

    const leaves = leaveRes.data || [];
    const balance = balanceRes.data;

    const currentYear = new Date().getFullYear();

    let taken = 0;
    leaves.forEach((leave) => {
      if (
        leave.status === "APPROVED" &&
        new Date(leave.start_date).getFullYear() === currentYear
      ) {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        taken +=
          Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    });

    setLeaveSummary({
      total: balance.total_leaves,
      taken,
      balance: balance.total_leaves - taken,
    });
  };

  useEffect(() => {
    loadAttendance();
    loadLeaveSummary();
  }, [location.pathname]);

  useEffect(() => {
    let timer;
    if (working) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => timer && clearInterval(timer);
  }, [working]);

  /* ================= HELPERS ================= */
  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const summary = {
    hours: records
      .reduce((t, r) => t + Number(r.working_hours || 0), 0)
      .toFixed(2),
  };

  /* ================= ACTIONS ================= */
  const handleSignIn = async () => {
    await employeeSignIn();
    loadAttendance();
  };

  const handleSignOut = async () => {
    await employeeSignOut();
    setWorking(false);
    loadAttendance();
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">

      {/* ================= LEAVE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LeaveCard title="Total Leaves (Year)" value={leaveSummary.total} />
        <LeaveCard title="Leaves Taken" value={leaveSummary.taken} />
        <LeaveCard title="Balance Leaves" value={leaveSummary.balance} />
        <LeaveCard title="Total Hours" value={`${summary.hours} hrs`} />
      </div>

      {/* ================= TODAY ================= */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-4">Today Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <Info label="Status">
            <StatusBadge status={today?.status || "NOT_MARKED"} />
          </Info>
          <Info label="Sign In" value={today?.sign_in || "-"} />
          <Info label="Sign Out" value={today?.sign_out || "-"} />
          <Info label="Working Time" value={formatTime()} />
        </div>

        <div className="mt-6">
          {!today?.sign_in && (
            <button
              onClick={handleSignIn}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Sign In
            </button>
          )}
          {today?.sign_in && !today?.sign_out && (
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* ================= RECENT ATTENDANCE ================= */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Recent Attendance</h3>
          <button
            onClick={() => navigate("/employee/attendance")}
            className="text-blue-600 text-sm"
          >
            View All →
          </button>
        </div>

        {records.slice(0, 3).map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center border rounded p-4 mb-2"
          >
            <div>
              <p className="font-medium">{r.date}</p>
              <p className="text-xs text-gray-500">
                {r.sign_in || "-"} → {r.sign_out || "-"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span>{r.working_hours} hrs</span>
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= UI ================= */

const LeaveCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-xl shadow border">
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value}</h2>
  </div>
);

const Info = ({ label, value, children }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="font-medium">{children || value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    HALF_DAY: "bg-yellow-100 text-yellow-700",
    NOT_MARKED: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${map[status]}`}>
      {status}
    </span>
  );
};

export default EmployeeDashboard;
