import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading, waking } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="animate-float text-5xl">🎯</div>
        {waking && (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Waking up the server... hang tight!
          </p>
        )}
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
