import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      
      {/* LEFT – USER INFO */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome,{" "}
          <span className="text-blue-600">
            {user?.email}
          </span>
        </h1>
        <p className="text-xs text-gray-500 capitalize">
          {user?.role?.toLowerCase()}
        </p>
      </div>

      {/* RIGHT – ACTIONS */}
      <div className="flex items-center gap-4">

        {/*NOTIFICATIONS */}
        <NotificationBell />

        {/* APPLY LEAVE – EMPLOYEE ONLY */}
        {user?.role === "EMPLOYEE" && (
          <button
            onClick={() => navigate("/employee/leave")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Apply Leave
          </button>
        )}

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
