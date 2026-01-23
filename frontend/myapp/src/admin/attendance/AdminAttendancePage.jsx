import { useState } from "react";

// existing components
import AttendanceReport from "./AttendanceReport";
import LeaveApproval from "../leaves/LeaveApproval";

const AdminAttendancePage = () => {
  const [activeTab, setActiveTab] = useState("ATTENDANCE");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Attendance & Leave Management
      </h1>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("ATTENDANCE")}
          className={`pb-2 font-medium ${
            activeTab === "ATTENDANCE"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Attendance
        </button>

        <button
          onClick={() => setActiveTab("LEAVES")}
          className={`pb-2 font-medium ${
            activeTab === "LEAVES"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Leave Approvals
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      {activeTab === "ATTENDANCE" && <AttendanceReport />}

      {activeTab === "LEAVES" && <LeaveApproval />}
    </div>
  );
};

export default AdminAttendancePage;
