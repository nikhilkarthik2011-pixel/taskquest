import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signup({ name, email, password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="animate-float mb-2 text-5xl">🚀</div>
          <h1 className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-200">
            Start your quest
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Track tasks, earn points, level up
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-pop space-y-3 p-6">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Name
            </span>
            <input
              required
              className="input-pop"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Email
            </span>
            <input
              type="email"
              required
              className="input-pop"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              className="input-pop"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="mt-1 block text-xs text-slate-400">At least 6 characters</span>
          </label>

          {error && <p className="text-sm font-semibold text-urgent">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-pop w-full bg-gradient-to-r from-brand-500 to-brand-600 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
