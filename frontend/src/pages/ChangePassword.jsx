import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import API             from "../api";
import { useAuth }     from "../context/useAuth";

export default function ChangePassword() {
  const [form, setForm]     = useState({ newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (form.newPassword !== form.confirm) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await API.put("/auth/change-password", { newPassword: form.newPassword });

      // Refresh user data
      const res = await API.get("/auth/me");
      login({ ...res.data, token: localStorage.getItem("token") });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm
                      border border-gray-100 p-8">

        <div className="text-center mb-6">
          <h1 className="text-green-900 text-xl font-bold">
            Mentoring<span className="text-green-500"> Hub</span>
          </h1>
          <h2 className="text-lg font-bold text-gray-800 mt-4">
            Set New Password
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            You must change your password before continuing.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-green-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-green-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-900 hover:bg-green-800 text-white
                       font-medium py-2.5 rounded-xl text-sm transition-all
                       disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Saving...
              </>
            ) : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}