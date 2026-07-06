import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function CoordStudents() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [branch,   setBranch]   = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (branch) params.branch = branch;
      const res = await API.get("/coordinator/students", { params });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, branch]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Students</h2>
        <p className="text-gray-400 text-sm mb-6">
          View all students in your department.
        </p>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-6 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search name, email, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Filter by branch..."
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No students found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Student","Roll No","Branch","Section","Semester","Batch"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs
                                           text-gray-400 uppercase font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}
                      className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex
                                        items-center justify-center text-blue-800
                                        text-xs font-bold">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {s.rollNo || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.branch || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.section || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.semester || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.batch || "—"}</td>
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