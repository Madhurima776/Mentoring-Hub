import { useEffect, useState } from "react";
import Sidebar                 from "../../components/Sidebar";
import API                     from "../../api";
import { CheckCircle2 }        from "lucide-react";

export default function StudentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [answers,   setAnswers]   = useState({});
  const [msg,       setMsg]       = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await API.get("/student/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleAnswer = async (id) => {
    if (!answers[id]) return setMsg("Please type an answer first");
    try {
      await API.put(`/student/questions/${id}/answer`, { answer: answers[id] });
      setMsg("Answer submitted");
      fetchQuestions();
      setAnswers({ ...answers, [id]: "" });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to submit");
    }
  };

  const categoryColor = (c) => ({
    attendance: "bg-red-100    text-red-700",
    project:    "bg-blue-100   text-blue-700",
    academic:   "bg-purple-100 text-purple-700",
    behaviour:  "bg-amber-100  text-amber-700",
    general:    "bg-gray-100   text-gray-600",
  }[c] || "bg-gray-100 text-gray-600");

  const pending  = questions.filter((q) => !q.isAnswered);
  const answered = questions.filter((q) =>  q.isAnswered);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Questions from Mentor</h2>
        <p className="text-gray-400 text-sm mb-6">
          Answer all pending questions from your mentor.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("submitted")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
            }`}>
            {msg}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Pending
                  <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                </h3>
                {pending.map((q) => (
                  <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${categoryColor(q.category)}`}>
                        {q.category}
                      </span>
                      <span className="text-xs text-gray-400">from {q.mentor?.name}</span>
                    </div>
                    <p className="text-gray-800 font-medium mb-3">{q.question}</p>
                    <textarea
                      placeholder="Type your answer here..."
                      value={answers[q._id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
                    />
                    <button
                      onClick={() => handleAnswer(q._id)}
                      className="px-4 py-2 bg-green-900 hover:bg-green-800 text-white text-sm rounded-xl transition"
                    >
                      Submit Answer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {answered.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Answered
                  <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                    {answered.length}
                  </span>
                </h3>
                {answered.map((q) => (
                  <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-3 opacity-75">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mb-2 inline-block ${categoryColor(q.category)}`}>
                      {q.category}
                    </span>
                    <p className="text-gray-700 font-medium mb-2">{q.question}</p>
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <p className="text-xs text-green-600 mb-1">Your answer:</p>
                      <p className="text-sm text-gray-700">{q.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questions.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <CheckCircle2
                  size={40}
                  className="text-green-500 mx-auto mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-gray-500">No questions from mentor yet.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}