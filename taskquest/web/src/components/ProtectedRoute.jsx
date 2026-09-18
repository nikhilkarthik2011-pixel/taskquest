import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-float text-5xl">🎯</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
