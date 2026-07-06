import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";
import { Bell, CheckCircle2 } from "lucide-react";

export default function CoordReminders() {
  const [pending,  setPending]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [msg,      setMsg]      = useState("");
  const [weekDate, setWeekDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/coordinator/pending-reports?weekStartDate=${weekDate}`
      );
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [weekDate]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleBulkRemind = async () => {
    try {
      setSending(true);
      const res = await API.post("/coordinator/remind-all-pending", {
        weekStartDate: weekDate,
      });
      setMsg(
        `✅ Sent to ${res.data.mentorsReminded} mentors and
         ${res.data.studentsReminded} students`
      );
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    } finally {
      setSending(false);
    }
  };

  const handleRemindMentor = async (mentorId) => {
    try {
      await API.post("/coordinator/remind-mentor", {
        mentorId,
        type:    "weekly_report_pending",
        message: "Please submit your weekly mentoring report.",
      });
      setMsg("Reminder sent ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to send reminder");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Reminders</h2>
        <p className="text-gray-400 text-sm mb-6">
          Track who hasn't responded and send reminders.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Week Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-6 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Check Week Starting
            </label>
            <input
              type="date"
              value={weekDate}
              onChange={(e) => setWeekDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleBulkRemind}
            disabled={sending}
            className="px-5 py-2 bg-green-900 hover:bg-green-800 text-white
                       text-sm font-medium rounded-xl transition
                       disabled:opacity-60"
          >
            {sending ? "Sending..." : <><Bell size={14} strokeWidth={1.8} className="inline mr-1" /> Send All Pending Reminders</>
}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : pending ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-gray-800">{pending.total}</p>
              <p className="text-sm text-gray-500 mt-1">Total Mentors</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-green-700">{pending.submitted}</p>
              <p className="text-sm text-green-600 mt-1">Submitted Reports</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-red-700">{pending.pending}</p>
              <p className="text-sm text-red-600 mt-1">Pending Reports</p>
            </div>
          </div>
        ) : null}

        {/* Pending Mentors */}
        {pending?.pendingMentors?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Mentors Pending Report
            </h3>
            {pending.pendingMentors.map((m) => (
              <div key={m._id}
                   className="flex items-center justify-between py-3
                              border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex
                                  items-center justify-center text-red-700
                                  font-bold text-sm">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemindMentor(m._id)}
                  className="px-3 py-1.5 text-xs bg-amber-50 border
                             border-amber-200 text-amber-700 rounded-lg
                             hover:bg-amber-100 transition"
                >
                  Send Reminder
                </button>
              </div>
            ))}
          </div>
        )}

        {pending?.pending === 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-green-700 font-medium">All mentors have submitted their reports!</p>
          </div>
        )}
      </main>
    </div>
  );
}