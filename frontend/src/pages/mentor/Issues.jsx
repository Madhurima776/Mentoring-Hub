import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function MentorIssues() {
  const [students, setStudents] = useState([]);
  const [issues,   setIssues]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [form,     setForm]     = useState({
    studentId: "", title: "", description: "", priority: "medium",
  });

  const fetchIssues = useCallback(async () => {
    try {
      const res = await API.get("/coordinator/issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    API.get("/mentor/students").then((res) => setStudents(res.data));
    fetchIssues();
  }, [fetchIssues]);

  const handleRaise = async () => {
    if (!form.studentId || !form.title) {
      return setMsg("Student and title are required");
    }
    try {
      await API.post("/mentor/issues", form);
      setMsg("Issue raised ✅");
      setForm({ studentId: "", title: "", description: "", priority: "medium" });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    }
  };

  const priorityColor = (p) => ({
    high:   "bg-red-100    text-red-700",
    medium: "bg-amber-100  text-amber-700",
    low:    "bg-gray-100   text-gray-600",
  }[p] || "bg-gray-100 text-gray-600");

  const statusColor = (s) => ({
    open:       "bg-red-100    text-red-700",
    inprogress: "bg-blue-100   text-blue-700",
    resolved:   "bg-green-100  text-green-700",
  }[s] || "bg-gray-100 text-gray-600");

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Issues</h2>
        <p className="text-gray-400 text-sm mb-6">
          Raise issues about students to the coordinator.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Raise Issue Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Raise New Issue</h3>
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
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Brief title of the issue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  placeholder="Detailed description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <div className="flex gap-2">
                  {["low","medium","high"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium
                                  border transition capitalize
                        ${form.priority === p
                          ? "bg-green-900 text-white border-green-900"
                          : "bg-white text-gray-500 border-gray-200"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleRaise}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Raise Issue
              </button>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Issues ({issues.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : issues.length === 0 ? (
              <p className="text-gray-400 text-sm">No issues raised yet.</p>
            ) : (
              issues.map((i) => (
                <div key={i._id}
                     className="p-3 bg-gray-50 rounded-xl mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      font-medium ${priorityColor(i.priority)}`}>
                      {i.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      font-medium ${statusColor(i.status)}`}>
                      {i.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{i.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Student: {i.student?.name || "N/A"}
                  </p>
                  {i.resolution && (
                    <div className="mt-2 bg-green-50 border border-green-100
                                    rounded-lg px-3 py-2">
                      <p className="text-xs text-green-600">
                        Resolution: {i.resolution}
                      </p>
                    </div>
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