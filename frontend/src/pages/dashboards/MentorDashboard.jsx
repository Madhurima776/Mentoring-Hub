import { useEffect, useState } from "react";
import { useAuth }             from "../../context/useAuth";
import Sidebar                 from "../../components/Sidebar";
import StatCard                from "../../components/StatCard";
import API                     from "../../api";
import {
  Users,
  ClipboardList,
  HelpCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function MentorDashboard() {
  const { user }                  = useAuth();
  const [students,  setStudents]  = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, q, se] = await Promise.all([
          API.get("/mentor/students"),
          API.get("/mentor/questions"),
          API.get("/mentor/sessions"),
        ]);
        setStudents(s.data);
        setQuestions(q.data);
        setSessions(se.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const unanswered = questions.filter((q) => !q.isAnswered).length;
  const thisMonth  = sessions.filter((s) => {
    const d = new Date(s.date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Welcome, {user?.name}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{new Date().toDateString()}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="My Students"      value={students.length}           icon={Users}         color="green"  />
            <StatCard label="Sessions (Month)" value={thisMonth}                 icon={ClipboardList} color="blue"   />
            <StatCard label="Unanswered Qs"    value={unanswered}                icon={HelpCircle}    color="amber"  />
            <StatCard label="Department"       value={user?.department || "N/A"} icon={Building2}     color="purple" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* My Students */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">My Students</h3>
            </div>
            {students.slice(0, 5).map((s) => (
              <div key={s._id}
                   className="flex items-center justify-between py-2.5
                              border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center
                                  justify-center text-green-800 text-sm font-bold">
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNo} · {s.branch}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{s.section}</span>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-gray-400 text-sm">No students assigned yet.</p>
            )}
          </div>

          {/* Unanswered Questions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Unanswered Questions</h3>
              {unanswered > 0 && (
                <span className="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                  {unanswered}
                </span>
              )}
            </div>
            {questions.filter((q) => !q.isAnswered).slice(0, 4).map((q) => (
              <div key={q._id} className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-gray-500 mb-1">
                  To: {q.student?.name || "Student"}
                </p>
                <p className="text-sm text-gray-700">{q.question}</p>
              </div>
            ))}
            {unanswered === 0 && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle2 size={16} className="text-green-500" strokeWidth={1.8} />
                All questions answered
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Recent Sessions</h3>
            </div>
            {sessions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                    <th className="text-left pb-2">Student</th>
                    <th className="text-left pb-2">Date</th>
                    <th className="text-left pb-2">Purpose</th>
                    <th className="text-left pb-2">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 5).map((s) => (
                    <tr key={s._id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 font-medium text-gray-800">
                        {s.student?.name || "N/A"}
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {new Date(s.date).toDateString()}
                      </td>
                      <td className="py-2.5 text-gray-500">{s.purpose}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${s.attendanceStatus === "present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}>
                          {s.attendanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-sm">No sessions recorded yet.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}