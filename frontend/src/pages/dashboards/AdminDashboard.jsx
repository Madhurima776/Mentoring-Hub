import { useEffect, useState } from "react";
import Sidebar                 from "../../components/Sidebar";
import StatCard                from "../../components/StatCard";
import API                     from "../../api";
import { useNavigate }         from "react-router-dom";

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

useEffect(() => {
  let isMounted = true;

  const fetchAll = async () => {
    try {
      const [s, u] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
      ]);
      if (isMounted) {
        setStats(s.data);
        setUsers(u.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchAll();

  return () => {
    isMounted = false;
  };
}, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Admin Panel 🛠️
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            System overview · {new Date().toDateString()}
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
            <StatCard label="Total Users"   value={stats?.total        || 0} icon="👥" color="green"  />
            <StatCard label="Students"      value={stats?.students     || 0} icon="👨‍🎓" color="blue"   />
            <StatCard label="Mentors"       value={stats?.mentors      || 0} icon="👨‍🏫" color="amber"  />
            <StatCard label="Coordinators"  value={stats?.coordinators || 0} icon="🏫" color="purple" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/upload")}
                className="w-full flex items-center gap-3 p-3 bg-green-50
                           border border-green-100 rounded-xl text-sm
                           text-green-800 hover:bg-green-100 transition"
              >
                📤 Bulk Upload Users (CSV / Excel)
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center gap-3 p-3 bg-blue-50
                           border border-blue-100 rounded-xl text-sm
                           text-blue-800 hover:bg-blue-100 transition"
              >
                👥 Manage All Users
              </button>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Recent Users</h3>
            {users.slice(0, 5).map((u) => (
              <div key={u._id}
                   className="flex items-center justify-between py-2.5
                              border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center
                                  justify-center text-gray-600 text-sm font-bold">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${u.role === "admin"       ? "bg-purple-100 text-purple-700" :
                    u.role === "coordinator" ? "bg-blue-100   text-blue-700"   :
                    u.role === "mentor"      ? "bg-green-100  text-green-700"  :
                                              "bg-gray-100   text-gray-600"   }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}