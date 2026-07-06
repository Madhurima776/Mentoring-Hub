import { useEffect, useState, useMemo } from "react";
import { useAuth }             from "../../context/useAuth";
import Sidebar                 from "../../components/Sidebar";
import StatCard                from "../../components/StatCard";
import API                     from "../../api";
import { Users, GraduationCap, AlertTriangle, ClipboardList, CheckCircle2 } from "lucide-react";

export default function CoordinatorDashboard() {
  const { user }                = useAuth();
  const [mentors,  setMentors]  = useState([]);
  const [students, setStudents] = useState([]);
  const [issues,   setIssues]   = useState([]);
  const [pending,  setPending]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  const weekStartStr = useMemo(() => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  return weekStart.toISOString().split("T")[0];
}, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, s, i, p] = await Promise.all([
          API.get("/coordinator/mentors"),
          API.get("/coordinator/students"),
          API.get("/coordinator/issues?status=open"),
          API.get(`/coordinator/pending-reports?weekStartDate=${weekStartStr}`).catch(() => ({ data: null })),
        ]);
        setMentors(m.data);
        setStudents(s.data);
        setIssues(i.data);
        setPending(p.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [weekStartStr]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Coordinator Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">
            {user?.department} Department · {new Date().toDateString()}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Mentors"   value={mentors.length}        icon={Users}          color="green"  />
            <StatCard label="Total Students"  value={students.length}       icon={GraduationCap}  color="blue"   />
            <StatCard label="Open Issues"     value={issues.length}         icon={AlertTriangle}  color="amber"  />
            <StatCard label="Pending Reports" value={pending?.pending || 0} icon={ClipboardList}  color="red"    />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pending?.pendingMentors?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-700" strokeWidth={1.8} />
                <h3 className="font-semibold text-amber-800">
                  Mentors Who Haven't Submitted Weekly Report
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pending.pendingMentors.map((m) => (
                  <span key={m._id} className="bg-white border border-amber-200 text-amber-700 text-sm px-3 py-1 rounded-full">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Mentors</h3>
            </div>
            {mentors.slice(0, 5).map((m) => (
              <div key={m._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-sm font-bold">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.employeeId}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-gray-400" strokeWidth={1.8} />
              <h3 className="font-semibold text-gray-700">Open Issues</h3>
            </div>
            {issues.slice(0, 4).map((issue) => (
              <div key={issue._id} className="mb-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${issue.priority === "high" ? "bg-red-100 text-red-700" :
                      issue.priority === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"}`}>
                    {issue.priority}
                  </span>
                  <span className="text-xs text-gray-400">by {issue.raisedBy?.name}</span>
                </div>
              </div>
            ))}
            {issues.length === 0 && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CheckCircle2 size={16} className="text-green-500" strokeWidth={1.8} />
                No open issues
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}