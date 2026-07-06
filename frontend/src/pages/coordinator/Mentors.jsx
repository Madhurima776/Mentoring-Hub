import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function CoordMentors() {
  const [mentors,  setMentors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [form,     setForm]     = useState({
    name: "", email: "", employeeId: "", branch: "", section: "",
  });
  const [showForm, setShowForm] = useState(false);

  const fetchMentors = useCallback(async () => {
    try {
      const res = await API.get("/coordinator/mentors");
      setMentors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  const handleAdd = async () => {
    if (!form.name || !form.email) {
      return setMsg("Name and email are required");
    }
    try {
      await API.post("/coordinator/mentors", form);
      setMsg("Mentor added ✅");
      setForm({ name: "", email: "", employeeId: "", branch: "", section: "" });
      setShowForm(false);
      fetchMentors();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to add");
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove ${name} from department?`)) return;
    try {
      await API.delete(`/coordinator/mentors/${id}`);
      setMsg("Mentor removed ✅");
      fetchMentors();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Mentors</h2>
            <p className="text-gray-400 text-sm mt-1">
              Manage mentors in your department.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-900 hover:bg-green-800 text-white
                       text-sm rounded-xl transition"
          >
            {showForm ? "Cancel" : "+ Add Mentor"}
          </button>
        </div>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Add Mentor Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Add New Mentor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "name",       label: "Full Name",    placeholder: "Dr. John Doe"      },
                { key: "email",      label: "Email",        placeholder: "john@svecw.edu.in" },
                { key: "employeeId", label: "Employee ID",  placeholder: "FAC010"            },
                { key: "branch",     label: "Branch",       placeholder: "CSE"               },
                { key: "section",    label: "Section",      placeholder: "A"                 },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-2.5 bg-green-900 hover:bg-green-800
                         text-white font-medium rounded-xl text-sm transition"
            >
              Add Mentor
            </button>
          </div>
        )}

        {/* Mentors Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : mentors.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No mentors in your department yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Mentor","Email","Employee ID","Branch","Status","Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs
                                           text-gray-400 uppercase font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mentors.map((m) => (
                  <tr key={m._id}
                      className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex
                                        items-center justify-center text-green-800
                                        text-sm font-bold">
                          {m.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.email}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {m.employeeId || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.branch || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 text-xs
                                       px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(m._id, m.name)}
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