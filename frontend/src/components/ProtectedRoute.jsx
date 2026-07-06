import { Navigate } from "react-router-dom";
import { useAuth }   from "../context/useAuth";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-900 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Force password change on first login
  if (user.isFirstLogin && window.location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}