import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

const CATEGORIES = ["attendance", "project", "academic", "behaviour", "general"];

export default function MentorQuestions() {
  const [students,  setStudents]  = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState("");
  const [form,      setForm]      = useState({
    studentId: "", category: "general", question: "",
  });

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await API.get("/mentor/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    API.get("/mentor/students").then((res) => setStudents(res.data));
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAsk = async () => {
    if (!form.studentId || !form.question) {
      return setMsg("Student and question are required");
    }
    try {
      await API.post("/mentor/questions", form);
      setMsg("Question sent ✅");
      setForm({ studentId: "", category: "general", question: "" });
      fetchQuestions();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    }
  };

  const categoryColor = (c) => ({
    attendance:  "bg-red-100    text-red-700",
    project:     "bg-blue-100   text-blue-700",
    academic:    "bg-purple-100 text-purple-700",
    behaviour:   "bg-amber-100  text-amber-700",
    general:     "bg-gray-100   text-gray-600",
  }[c] || "bg-gray-100 text-gray-600");

  const pending  = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) =>  q.isAnswered);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Questions</h2>
        <p className="text-gray-400 text-sm mb-6">
          Ask questions to students about attendance, projects, etc.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Ask Question Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Ask a Question</h3>
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
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, category: c })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium
                                  border transition capitalize
                        ${form.category === c
                          ? "bg-green-900 text-white border-green-900"
                          : "bg-white text-gray-500 border-gray-200"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Question</label>
                <textarea
                  placeholder="Type your question..."
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500 resize-none"
                />
              </div>

              <button
                onClick={handleAsk}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Send Question
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-3xl font-bold text-amber-700">{pending.length}</p>
              <p className="text-sm text-amber-600">Awaiting answers</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <p className="text-3xl font-bold text-green-700">{answered.length}</p>
              <p className="text-sm text-green-600">Answered</p>
            </div>
          </div>
        </div>

        {/* Pending Questions */}
        {pending.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Awaiting Answer
              <span className="ml-2 bg-amber-100 text-amber-600 text-xs
                               px-2 py-0.5 rounded-full">{pending.length}</span>
            </h3>
            {pending.map((q) => (
              <div key={q._id}
                   className="bg-white rounded-2xl border border-amber-100
                              shadow-sm p-5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                    capitalize ${categoryColor(q.category)}`}>
                    {q.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    To: {q.student?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    · {new Date(q.createdAt).toDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{q.question}</p>
              </div>
            ))}
          </div>
        )}

        {/* Answered Questions */}
        {answered.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Answered
              <span className="ml-2 bg-green-100 text-green-600 text-xs
                               px-2 py-0.5 rounded-full">{answered.length}</span>
            </h3>
            {answered.map((q) => (
              <div key={q._id}
                   className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                    capitalize ${categoryColor(q.category)}`}>
                    {q.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {q.student?.name}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {q.question}
                </p>
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-green-600 mb-1">Answer:</p>
                  <p className="text-sm text-gray-700">{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      </main>
    </div>
  );
}