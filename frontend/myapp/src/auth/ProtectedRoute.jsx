import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;   // 🔴 THIS IS THE KEY FIX
};

export default ProtectedRoute;
