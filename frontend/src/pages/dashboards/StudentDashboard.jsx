import { useEffect, useState } from "react";
import { useAuth }             from "../../context/useAuth";
import Sidebar                 from "../../components/Sidebar";
import StatCard                from "../../components/StatCard";
import API                     from "../../api";
import { BarChart2, BookOpen, HelpCircle, Bell, UserCircle2, TrendingUp, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user }                  = useAuth();
  const [mentor,    setMentor]    = useState(null);
  const [records,   setRecords]   = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, r, q, rem] = await Promise.all([
          API.get("/student/mentor").catch(() => ({ data: null })),
          API.get("/student/academic"),
          API.get("/student/questions"),
          API.get("/student/reminders"),
        ]);
        setMentor(m.data);
        setRecords(r.data);
        setQuestions(q.data);
        setReminders(rem.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const unreadReminders  = reminders.filter((r) => !r.isRead).length;
  const pendingQuestions = questions.filter((q) => !q.isAnswered).length;
  const avgMarks = records.length
    ? Math.round(
        records.reduce((acc, r) => {
          const total = r.midExamMarks.obtained + r.semExamMarks.obtained;
          const max   = r.midExamMarks.total    + r.semExamMarks.total;
          return acc + (total / max) * 100;
        }, 0) / records.length
      )
    : 0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Welcome back, {user?.name}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toDateString()}
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Avg Marks"        value={`${avgMarks}%`}   icon={BarChart2}  color="green"  />
            <StatCard label="Subjects"         value={records.length}   icon={BookOpen}   color="blue"   />
            <StatCard label="Pending Questions" value={pendingQuestions} icon={HelpCircle} color="amber"  />
            <StatCard label="Unread Reminders" value={unreadReminders}  icon={Bell}       color="purple" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Mentor Info */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle2 size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">My Mentor</h3>
            </div>
            {mentor ? (
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center
                                justify-center text-green-800 font-bold text-lg">
                  {mentor.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{mentor.name}</p>
                  <p className="text-sm text-gray-400">{mentor.email}</p>
                  <p className="text-sm text-gray-400">{mentor.department}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No mentor assigned yet.</p>
            )}
          </div>

          {/* Pending Questions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">
                Pending Questions
              </h3>
              {pendingQuestions > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {pendingQuestions}
                </span>
              )}
            </div>
            {questions.filter((q) => !q.isAnswered).slice(0, 3).map((q) => (
              <div key={q._id} className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-gray-700">{q.question}</p>
                <span className="text-xs text-amber-600 capitalize mt-1 inline-block">
                  {q.category}
                </span>
              </div>
            ))}
            {pendingQuestions === 0 && (
              <p className="text-gray-400 text-sm">No pending questions.</p>
            )}
          </div>

          {/* Academic Progress */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Academic Progress</h3>
            </div>
            {records.slice(0, 4).map((r) => {
              const pct = Math.round(
                ((r.midExamMarks.obtained + r.semExamMarks.obtained) /
                 (r.midExamMarks.total    + r.semExamMarks.total)) * 100
              );
              return (
                <div key={r._id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{r.subject}</span>
                    <span className="font-medium text-gray-800">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-green-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {records.length === 0 && (
              <p className="text-gray-400 text-sm">No academic records yet.</p>
            )}
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Recent Reminders</h3>
            </div>
            {reminders.slice(0, 3).map((r) => (
              <div key={r._id}
                   className={`mb-3 p-3 rounded-xl border text-sm
                     ${r.isRead
                       ? "bg-gray-50 border-gray-100 text-gray-500"
                       : "bg-blue-50 border-blue-100 text-gray-700"
                     }`}>
                <p>{r.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toDateString()}
                </p>
              </div>
            ))}
            {reminders.length === 0 && (
              <p className="text-gray-400 text-sm">No reminders yet.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}