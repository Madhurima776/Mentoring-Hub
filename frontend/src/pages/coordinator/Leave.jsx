import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function CoordLeave() {
  const [mentors,  setMentors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [msg,      setMsg]      = useState("");
  const [form,     setForm]     = useState({
    mentorOnLeaveId:    "",
    substituteMentorId: "",
    weekStartDate:      "",
    weekEndDate:        "",
    reason:             "",
  });

  const fetchMentors = useCallback(async () => {
    try {
      const res = await API.get("/coordinator/mentors");
      setMentors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  const handleAssignSubstitute = async () => {
    if (!form.mentorOnLeaveId || !form.substituteMentorId ||
        !form.weekStartDate   || !form.weekEndDate) {
      return setMsg("All fields are required");
    }
    if (form.mentorOnLeaveId === form.substituteMentorId) {
      return setMsg("Mentor on leave and substitute cannot be the same");
    }
    try {
      setSending(true);
      const res = await API.post("/coordinator/substitute", form);
      setMsg(`✅ Substitute assigned. ${res.data.assigned} students notified.`);
      setForm({
        mentorOnLeaveId: "", substituteMentorId: "",
        weekStartDate: "", weekEndDate: "", reason: "",
      });
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Leave & Substitution
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Manage mentor leaves and assign substitutes for the week.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-6">
            Assign Substitute Mentor
          </h3>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading mentors...</p>
          ) : (
            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Mentor on Leave
                  </label>
                  <select
                    value={form.mentorOnLeaveId}
                    onChange={(e) => setForm({ ...form, mentorOnLeaveId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  >
                    <option value="">Select mentor</option>
                    {mentors.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Substitute Mentor
                  </label>
                  <select
                    value={form.substituteMentorId}
                    onChange={(e) => setForm({ ...form, substituteMentorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  >
                    <option value="">Select substitute</option>
                    {mentors
                      .filter((m) => m._id !== form.mentorOnLeaveId)
                      .map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Leave From
                  </label>
                  <input
                    type="date"
                    value={form.weekStartDate}
                    onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Leave To
                  </label>
                  <input
                    type="date"
                    value={form.weekEndDate}
                    onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  placeholder="Reason for leave"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  ℹ️ When you assign a substitute, all students of the mentor on
                  leave will automatically receive a notification about the change.
                </p>
              </div>

              <button
                onClick={handleAssignSubstitute}
                disabled={sending}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all
                           disabled:opacity-60"
              >
                {sending ? "Assigning..." : "Assign Substitute & Notify Students"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}