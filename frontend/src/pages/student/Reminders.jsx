import { useEffect, useState } from "react";
import Sidebar                 from "../../components/Sidebar";
import API                     from "../../api";
import {
  Bell,
  ClipboardList,
  HelpCircle,
  Handshake,
  FileText,
} from "lucide-react";

export default function StudentReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await API.get("/student/reminders");
      setReminders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/student/reminders/${id}/read`);
      setReminders(reminders.map((r) =>
        r._id === id ? { ...r, isRead: true } : r
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcon = (t) => {
    const props = { size: 20, strokeWidth: 1.8 };
    return {
      weekly_report_pending: <ClipboardList {...props} className="text-blue-500"   />,
      question_unanswered:   <HelpCircle    {...props} className="text-amber-500"  />,
      offline_meet:          <Handshake     {...props} className="text-green-600"  />,
      form_unfilled:         <FileText      {...props} className="text-purple-500" />,
      general:               <Bell          {...props} className="text-gray-400"   />,
    }[t] || <Bell {...props} className="text-gray-400" />;
  };

  const unread = reminders.filter((r) => !r.isRead).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Reminders</h2>
        <p className="text-gray-400 text-sm mb-6">
          Notifications from your mentor and coordinator.
          {unread > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
              {unread} unread
            </span>
          )}
        </p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <Bell
              size={40}
              strokeWidth={1.5}
              className="text-gray-300 mx-auto mb-2"
            />
            <p className="text-gray-500">No reminders yet.</p>
          </div>
        ) : (
          reminders.map((r) => (
            <div key={r._id}
                 className={`bg-white rounded-2xl border shadow-sm p-5 mb-3 transition-all
                   ${r.isRead
                     ? "border-gray-100 opacity-70"
                     : "border-blue-100 bg-blue-50"
                   }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{typeIcon(r.type)}</div>
                  <div>
                    <p className={`text-sm font-medium
                      ${r.isRead ? "text-gray-600" : "text-gray-800"}`}>
                      {r.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      From: {r.sentBy?.name || "System"} ·{" "}
                      {new Date(r.createdAt).toDateString()}
                    </p>
                  </div>
                </div>
                {!r.isRead && (
                  <button
                    onClick={() => markRead(r._id)}
                    className="text-xs text-blue-600 hover:text-blue-800 shrink-0 ml-4"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}