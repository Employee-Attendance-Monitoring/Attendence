import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      
      {/* LEFT */}
      <h1 className="text-lg font-semibold">
        Welcome, {user?.email}
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        
        {/* APPLY LEAVE – ONLY FOR EMPLOYEE */}
        {user?.role === "EMPLOYEE" && (
          <button
            onClick={() => navigate("/employee/leave")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium"
          >
            Apply Leave
          </button>
        )}

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
