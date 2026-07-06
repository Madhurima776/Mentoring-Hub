import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import API from "../api";

export default function Login() {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Please fill in all fields.");
    }
    if (!form.email.includes("@")) {
      return setError("Please enter a valid email.");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      login(res.data);

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.msg || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Left Panel (branding) ── */}
      <div className="hidden lg:flex w-1/2 bg-green-900 flex-col justify-between p-12">

        {/* Top: Logo */}
        <div>
          <h1 className="text-white text-2xl font-bold">
            Counselling<span className="text-green-300"> Hub</span>
          </h1>
          <p className="text-green-400 text-xs mt-1 tracking-widest uppercase">
            Sreenidhi Institute
          </p>
        </div>

        {/* Middle: Tagline */}
        <div>
          <h2 className="text-white text-4xl font-bold leading-snug">
            Your support<br />
            system,<br />
            <span className="text-green-300">always here.</span>
          </h2>
          <p className="text-green-400 mt-4 text-sm leading-relaxed max-w-xs">
            Connect with counsellors, track your progress, and get the guidance
            you need — all in one place.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div className="flex gap-8">
          {[
            { label: "Students", value: "2,000+" },
            { label: "Faculty",  value: "150+"   },
            { label: "Sessions", value: "500+"   },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-green-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-green-900 text-2xl font-bold">
              Counselling<span className="text-green-500"> Hub</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1 tracking-widest uppercase">
              Sreenidhi Institute
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Use your college email to log in.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="you@svecw.edu.in"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           placeholder:text-gray-300 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                             placeholder:text-gray-300 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-900 hover:bg-green-800 text-white font-medium py-2.5 rounded-xl
                         text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Admin note */}
          <p className="mt-6 text-xs text-center text-gray-400">
            Access is provided by your institute admin.<br />
            Contact admin if you face any issues.
          </p>

        </div>
      </div>
    </div>
  );
}