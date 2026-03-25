import { useEffect, useState } from "react";
import {
  employeeSignIn,
  employeeSignOut,
  getMyAttendanceHistory,
} from "../../api/attendanceApi";
import { getMyLeaveBalance } from "../../api/leaveApi";
import { getEmployeeDashboardHighlights } from "../../api/employeeApi";
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
  const [actionLoading, setActionLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [leaveCards, setLeaveCards] = useState({});
  const [employees, setEmployees] = useState({
    birthdays: [],
    anniversaries: [],
    new_joiners: [],
  });

  const [leaveSummary, setLeaveSummary] = useState({
    total: 0,
    taken: 0,
    balance: 0,
  });

  /* ================= HELPERS ================= */

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const convertToHours = (timeStr) => {
    if (!timeStr) return 0;

    const h = timeStr.match(/(\d+)h/);
    const m = timeStr.match(/(\d+)m/);
    const s = timeStr.match(/(\d+)s/);

    const hours = h ? parseInt(h[1]) : 0;
    const minutes = m ? parseInt(m[1]) : 0;
    const seconds = s ? parseInt(s[1]) : 0;

    return hours + minutes / 60 + seconds / 3600;
  };

  /* ================= LOAD ATTENDANCE ================= */

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendanceHistory();
      const data = res.data || [];
      setRecords(data);

      // ✅ Total hours
      let total = 0;
      data.forEach((r) => {
        total += convertToHours(r.working_hours || "0h 0m");
      });
      setTotalHours(total.toFixed(2));

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

  /* ================= LOAD LEAVE ================= */

  const loadLeaveSummary = async () => {
    try {
      const res = await getMyLeaveBalance();
      const data = res.data || {};

      setLeaveSummary({
        total: data.total || 0,
        taken: data.taken || 0,
        balance: data.balance || 0,
      });

      setLeaveCards({
        paid: data.paid || { total: 0, used: 0 },
        sick: data.sick || { total: 0, used: 0 },
        casual: data.casual || { total: 0, used: 0 },
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOAD HIGHLIGHTS ================= */

  const loadEmployees = async () => {
    try {
      const res = await getEmployeeDashboardHighlights();
      setEmployees(res.data);
    } catch {
      setEmployees({
        birthdays: [],
        anniversaries: [],
        new_joiners: [],
      });
    }
  };

  useEffect(() => {
    loadAttendance();
    loadLeaveSummary();
    loadEmployees();
  }, [location.pathname]);

  useEffect(() => {
    let timer;
    if (working) {
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => timer && clearInterval(timer);
  }, [working]);

  /* ================= ACTIONS ================= */

  const handleSignIn = async () => {
    if (actionLoading) return;

    if (!window.confirm("Are you sure you want to sign in?")) return;
    setActionLoading(true);
    try {
      await employeeSignIn();
      await loadAttendance();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (actionLoading) return;

    if (!window.confirm("Are you sure you want to sign out?")) return;

    setActionLoading(true);
    try {
      await employeeSignOut();
      setWorking(false);
      await loadAttendance();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

        <SummaryCard title="Total Leaves" value={leaveSummary.total} />
        <SummaryCard title="Leaves Taken" value={leaveSummary.taken} />
        <SummaryCard title="Balance Leaves" value={leaveSummary.balance} />
        <SummaryCard title="Total Hours" value={`${totalHours} hrs`} />

        <SummaryCard title="Paid" value={`${leaveCards.paid?.used ?? 0}/${leaveCards.paid?.total ?? 0}`} />
        <SummaryCard title="Sick" value={`${leaveCards.sick?.used ?? 0}/${leaveCards.sick?.total ?? 0}`} />
        <SummaryCard title="Casual" value={`${leaveCards.casual?.used ?? 0}/${leaveCards.casual?.total ?? 0}`} />

      </div>

      {/* ================= TODAY ================= */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-4">Today Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <Info label="Status">
            <StatusBadge status={today?.status || "NOT_MARKED"} />
          </Info>

          <Info label="Sign In" value={formatDateTime(today?.sign_in)} />

          <Info
            label="Sign Out"
            value={
              <>
                {formatDateTime(today?.sign_out)}
                {today?.is_auto_signout && (
                  <span className="ml-2 text-xs text-orange-600">(Auto)</span>
                )}
              </>
            }
          />

          <Info label="Working Time" value={formatTime()} />
        </div>

        <div className="mt-6">
          {!today?.sign_in && (
            <button
              disabled={actionLoading}
              onClick={handleSignIn}
              className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Signing In..." : "Sign In"}
            </button>
          )}

          {today?.sign_in && !today?.sign_out && (
            <button
              disabled={actionLoading}
              onClick={handleSignOut}
              className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Signing Out..." : "Sign Out"}
            </button>
          )}
        </div>
      </div>

      {/* ================= HIGHLIGHTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card icon="🎂" title="Birthdays This Month"
          items={employees.birthdays.map((emp) => ({
            key: emp.id,
            name: emp.full_name,
            subtitle: formatDateDMY(emp.date),
            badge: formatDateDMY(emp.date),
            avatarBg: "bg-pink-100 text-pink-600",
            badgeStyle: "bg-pink-50 text-pink-600",
          }))}
          emptyText="No birthdays this month"
        />

        <Card icon="🏆" title="Work Anniversaries"
          items={employees.anniversaries.map((emp) => ({
            key: emp.id,
            name: emp.full_name,
            subtitle: `${emp.years} year`,
            badge: formatDateDMY(emp.date),
            avatarBg: "bg-yellow-100 text-yellow-600",
            badgeStyle: "bg-yellow-50 text-yellow-600",
          }))}
          emptyText="No anniversaries"
        />

        <Card icon="🎉" title="New Joiners"
          items={employees.new_joiners.map((emp) => ({
            key: emp.id,
            name: emp.full_name,
            subtitle: formatDateDMY(emp.date),
            badge: "New",
            avatarBg: "bg-blue-500 text-white",
            badgeStyle: "bg-indigo-50 text-indigo-600",
          }))}
          emptyText="No new joiners"
        />

      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const SummaryCard = ({ title, value }) => (
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

const Card = ({ icon, title, items, emptyText }) => (
  <div className="bg-white rounded-xl shadow border">
    <div className="px-6 py-4 border-b flex items-center gap-2">
      <span>{icon}</span>
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="p-6 space-y-4">
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyText}</p>
      ) : (
        items.map((item) => (
          <div key={item.key} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.badge}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

export default EmployeeDashboard;