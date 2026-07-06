import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function MentorSessions() {
  const [students,  setStudents]  = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState("");
  const [form,      setForm]      = useState({
    studentId:        "",
    date:             "",
    type:             "individual",
    purpose:          "",
    outcome:          "",
    notes:            "",
    attendanceStatus: "present",
    absentReason:     "",
    nextFollowUpDate: "",
  });

  const fetchSessions = useCallback(async () => {
    try {
      const res = await API.get("/mentor/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    API.get("/mentor/students").then((res) => setStudents(res.data));
    fetchSessions();
  }, [fetchSessions]);

  const handleSave = async () => {
    if (!form.studentId || !form.date || !form.purpose) {
      return setMsg("Student, date and purpose are required");
    }
    try {
      setSaving(true);
      await API.post("/mentor/sessions", form);
      setMsg("Session recorded ✅");
      setForm({
        studentId: "", date: "", type: "individual",
        purpose: "", outcome: "", notes: "",
        attendanceStatus: "present", absentReason: "",
        nextFollowUpDate: "",
      });
      fetchSessions();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Mentoring Sessions</h2>
        <p className="text-gray-400 text-sm mb-6">Record and view mentoring sessions.</p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Record Session Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Record New Session</h3>
            <div className="space-y-3">

              <div>
                <label className="block text-xs text-gray-500 mb-1">Student</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {["individual","group","online","offline"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Purpose</label>
                <input
                  type="text"
                  placeholder="Reason for this session"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Outcome</label>
                <textarea
                  placeholder="What was discussed/resolved"
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                             resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Private Notes
                </label>
                <textarea
                  placeholder="Your private notes (not visible to student)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                             resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Attendance</label>
                  <select
                    value={form.attendanceStatus}
                    onChange={(e) => setForm({ ...form, attendanceStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Next Follow Up
                  </label>
                  <input
                    type="date"
                    value={form.nextFollowUpDate}
                    onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {form.attendanceStatus === "absent" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Absent Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Reason for absence"
                    value={form.absentReason}
                    onChange={(e) => setForm({ ...form, absentReason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all
                           disabled:opacity-60"
              >
                {saving ? "Saving..." : "Record Session"}
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Recent Sessions ({sessions.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No sessions recorded yet.</p>
            ) : (
              sessions.slice(0, 10).map((s) => (
                <div key={s._id}
                     className="p-3 bg-gray-50 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">
                      {s.student?.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${s.attendanceStatus === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"}`}>
                        {s.attendanceStatus}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(s.date).toDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Purpose: {s.purpose}
                  </p>
                  {s.outcome && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Outcome: {s.outcome}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}