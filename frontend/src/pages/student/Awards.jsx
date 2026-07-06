import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

const TYPES = ["award", "hackathon", "competition", "other"];

export default function StudentAwards() {
  const [awards,  setAwards]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState("");
  const [form,    setForm]    = useState({
    title: "", description: "", type: "award",
  });

  const fetchAwards = async () => {
    try {
      const res = await API.get("/student/profile");
      setAwards(res.data.awards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAwards(); }, []);

  const handleAdd = async () => {
    if (!form.title) return setMsg("Title is required");
    try {
      const res = await API.post("/student/awards", form);
      setAwards(res.data.awards);
      setForm({ title: "", description: "", type: "award" });
      setMsg("Award added ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to add");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/student/awards/${id}`);
      setAwards(res.data.awards);
      setMsg("Removed ✅");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const typeColor = (t) => ({
    award:       "bg-amber-100  text-amber-700",
    hackathon:   "bg-purple-100 text-purple-700",
    competition: "bg-blue-100   text-blue-700",
    other:       "bg-gray-100   text-gray-600",
  }[t] || "bg-gray-100 text-gray-600");

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Awards & Hackathons</h2>
        <p className="text-gray-400 text-sm mb-6">
          Add achievements from this month.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
            }`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Add Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Add New</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. 1st place at Hackathon"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                             resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium
                                  border transition capitalize
                        ${form.type === t
                          ? "bg-green-900 text-white border-green-900"
                          : "bg-white text-gray-500 border-gray-200"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Add Achievement
              </button>
            </div>
          </div>

          {/* Awards List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              My Achievements ({awards.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : awards.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No achievements added yet.
              </p>
            ) : (
              awards.map((a) => (
                <div key={a._id}
                     className="flex items-start justify-between p-3
                                bg-gray-50 rounded-xl mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                                        font-medium capitalize ${typeColor(a.type)}`}>
                        {a.type}
                      </span>
                      <span className="text-xs text-gray-400">{a.month}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="text-red-400 hover:text-red-600 text-xs ml-3 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}