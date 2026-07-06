import { useEffect, useState } from "react";
import Sidebar                 from "../../components/Sidebar";
import API                     from "../../api";

const ROLES = ["all", "student", "mentor", "coordinator", "admin"];

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("all");
  const [msg,     setMsg]     = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (role   !== "all") params.role   = role;
      if (search)           params.search = search;
      const res = await API.get("/admin/users", { params });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchUsers();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [role]);

  const handleToggle = async (id) => {
    try {
      const res = await API.put(`/admin/users/${id}/toggle`);
      setMsg(res.data.msg);
      fetchUsers();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setMsg("User deleted");
      fetchUsers();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const roleColor = (r) => ({
    admin:       "bg-purple-100 text-purple-700",
    coordinator: "bg-blue-100   text-blue-700",
    mentor:      "bg-green-100  text-green-700",
    student:     "bg-gray-100   text-gray-600",
  }[r] || "bg-gray-100 text-gray-600");

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Manage Users</h2>
        <p className="text-gray-400 text-sm mb-6">
          View, activate, deactivate or delete users.
        </p>

        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          text-sm px-4 py-3 rounded-xl mb-4">
            {msg}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-6 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search name, email, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition
                  ${role === r
                    ? "bg-green-900 text-white border-green-900"
                    : "bg-white text-gray-500 border-gray-200 hover:border-green-300"
                  }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-green-900 text-white rounded-xl text-sm"
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name","Email","Role","Dept","Roll/ID","Status","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs
                                           text-gray-400 uppercase font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex
                                        items-center justify-center text-green-800
                                        text-xs font-bold shrink-0">
                          {u.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                        ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {u.rollNo || u.employeeId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${u.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium
                            border transition
                            ${u.isActive
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="px-3 py-1 rounded-lg text-xs font-medium
                                     border border-red-200 text-red-600
                                     hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}