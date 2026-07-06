import Sidebar from "../../components/Sidebar";
import API     from "../../api";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState, useCallback } from "react";

export default function StudentAcademic() {
  const { user }                  = useAuth();
  const [records,  setRecords]    = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [msg,      setMsg]        = useState("");
  const [semester, setSemester]   = useState(user?.semester || 1);
  const [form,     setForm]       = useState({
    semester: user?.semester || 1,
    subject:  "",
    midExamMarks: { obtained: "", total: 30 },
    semExamMarks: { obtained: "", total: 70 },
  });

  const fetchRecords = useCallback(async () => {
  try {
    setLoading(true);
    const res = await API.get(`/student/academic?semester=${semester}`);
    setRecords(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [semester]);


  useEffect(() => {
  fetchRecords();
}, [fetchRecords]);

  const handleSave = async () => {
    if (!form.subject) return setMsg("Subject is required");
    try {
      setSaving(true);
      await API.post("/student/academic", {
        ...form,
        semester: Number(semester),
        midExamMarks: {
          obtained: Number(form.midExamMarks.obtained),
          total:    Number(form.midExamMarks.total),
        },
        semExamMarks: {
          obtained: Number(form.semExamMarks.obtained),
          total:    Number(form.semExamMarks.total),
        },
      });
      setMsg("Marks saved ✅");
      setForm({
        semester: semester,
        subject:  "",
        midExamMarks: { obtained: "", total: 30 },
        semExamMarks: { obtained: "", total: 70 },
      });
      fetchRecords();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getPercent = (r) => {
    const obtained = r.midExamMarks.obtained + r.semExamMarks.obtained;
    const total    = r.midExamMarks.total    + r.semExamMarks.total;
    return total > 0 ? Math.round((obtained / total) * 100) : 0;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">

        <h2 className="text-xl font-bold text-gray-800 mb-1">Academic Records</h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter your mid and semester exam marks.
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

        {/* Semester Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[1,2,3,4,5,6,7,8].map((s) => (
            <button
              key={s}
              onClick={() => setSemester(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                ${semester === s
                  ? "bg-green-900 text-white border-green-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-green-300"
                }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Add Marks Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Add / Update Marks</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Mid Exam Marks
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Got"
                      value={form.midExamMarks.obtained}
                      onChange={(e) => setForm({
                        ...form,
                        midExamMarks: { ...form.midExamMarks, obtained: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={form.midExamMarks.total}
                      onChange={(e) => setForm({
                        ...form,
                        midExamMarks: { ...form.midExamMarks, total: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sem Exam Marks
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Got"
                      value={form.semExamMarks.obtained}
                      onChange={(e) => setForm({
                        ...form,
                        semExamMarks: { ...form.semExamMarks, obtained: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={form.semExamMarks.total}
                      onChange={(e) => setForm({
                        ...form,
                        semExamMarks: { ...form.semExamMarks, total: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all
                           disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Semester {semester} Records
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-gray-400 text-sm">No records for Semester {semester}.</p>
            ) : (
              records.map((r) => {
                const pct = getPercent(r);
                return (
                  <div key={r._id} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{r.subject}</span>
                      <span className={`font-bold
                        ${pct >= 75 ? "text-green-600" :
                          pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full mb-1">
                      <div
                        className={`h-2 rounded-full transition-all
                          ${pct >= 75 ? "bg-green-500" :
                            pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Mid: {r.midExamMarks.obtained}/{r.midExamMarks.total}</span>
                      <span>Sem: {r.semExamMarks.obtained}/{r.semExamMarks.total}</span>
                      <span>Attendance: {r.attendancePercent}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}