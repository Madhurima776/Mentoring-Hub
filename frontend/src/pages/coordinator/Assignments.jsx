import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function CoordAssignments() {
  const [mentors,     setMentors]     = useState([]);
  const [students,    setStudents]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState("");
  const [form,        setForm]        = useState({
    mentorId: "", studentId: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      const [m, s, a] = await Promise.all([
        API.get("/coordinator/mentors"),
        API.get("/coordinator/students"),
        API.get("/coordinator/assignments"),
      ]);
      setMentors(m.data);
      setStudents(s.data);
      setAssignments(a.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAssign = async () => {
    if (!form.mentorId || !form.studentId) {
      return setMsg("Please select both mentor and student");
    }
    try {
      await API.post("/coordinator/assign", {
        mentorId:  form.mentorId,
        studentId: form.studentId,
      });
      setMsg("Student assigned ✅");
      setForm({ mentorId: "", studentId: "" });
      fetchAll();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await API.delete(`/coordinator/assign/${id}`);
      setMsg("Assignment removed ✅");
      fetchAll();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Mentor Assignments
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Assign students to mentors in your department.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Assign Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Assign Student to Mentor</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs text-gray-500 mb-1">Mentor</label>
              <select
                value={form.mentorId}
                onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select mentor</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-48">
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
            <div className="flex items-end">
              <button
                onClick={handleAssign}
                className="px-6 py-2 bg-green-900 hover:bg-green-800 text-white
                           font-medium rounded-xl text-sm transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">
              Current Assignments ({assignments.length})
            </h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No assignments yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Student","Roll No","Mentor","Branch","Section","Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs
                                           text-gray-400 uppercase font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id}
                      className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.student?.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {a.student?.rollNo}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.mentor?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.branch}</td>
                    <td className="px-4 py-3 text-gray-500">{a.section}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(a._id)}
                        className="text-xs text-red-500 hover:text-red-700
                                   border border-red-200 px-3 py-1 rounded-lg
                                   hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
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