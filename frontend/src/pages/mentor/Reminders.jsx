import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function MentorReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState("");
  const [message,   setMessage]   = useState("");
  const [sending,   setSending]   = useState(false);

  useEffect(() => {
    API.get("/student/reminders")
      .then((res) => setReminders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sendOfflineMeet = async () => {
    try {
      setSending(true);
      await API.post("/mentor/reminders", { message });
      setMsg("Reminder sent to all students ✅");
      setMessage("");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const typeIcon = (t) => ({
    weekly_report_pending: "📋",
    question_unanswered:   "❓",
    offline_meet:          "🤝",
    form_unfilled:         "📝",
    general:               "🔔",
  }[t] || "🔔");

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Reminders</h2>
        <p className="text-gray-400 text-sm mb-6">
          Send offline meet reminders to your students.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Send Offline Meet Reminder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Send Offline Meet Reminder
          </h3>
          <textarea
            placeholder="Message to students (e.g. Please attend offline meet on Monday at 10 AM)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                       resize-none mb-3"
          />
          <button
            onClick={sendOfflineMeet}
            disabled={sending || !message}
            className="px-6 py-2.5 bg-green-900 hover:bg-green-800 text-white
                       font-medium rounded-xl text-sm transition-all
                       disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send to All My Students"}
          </button>
        </div>

        {/* Received Reminders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Reminders from Coordinator
          </h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : reminders.length === 0 ? (
            <p className="text-gray-400 text-sm">No reminders yet.</p>
          ) : (
            reminders.map((r) => (
              <div key={r._id}
                   className={`flex items-start gap-3 p-4 rounded-xl mb-3
                     ${r.isRead ? "bg-gray-50" : "bg-blue-50 border border-blue-100"}`}>
                <span className="text-xl">{typeIcon(r.type)}</span>
                <div>
                  <p className={`text-sm ${r.isRead ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                    {r.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}