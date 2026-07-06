import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function StudentCertifications() {
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState("");
  const [form,    setForm]    = useState({
    title: "", issuedBy: "", issuedDate: "", description: "",
  });

  const fetchCerts = async () => {
    try {
      const res = await API.get("/student/profile");
      setCerts(res.data.certifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCerts(); }, []);

  const handleAdd = async () => {
    if (!form.title) return setMsg("Title is required");
    try {
      const res = await API.post("/student/certifications", form);
      setCerts(res.data.certifications);
      setForm({ title: "", issuedBy: "", issuedDate: "", description: "" });
      setMsg("Certification added ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to add");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/student/certifications/${id}`);
      setCerts(res.data.certifications);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Certifications</h2>
        <p className="text-gray-400 text-sm mb-6">
          Add certifications you have earned.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
            }`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Add Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Add Certification</h3>
            <div className="space-y-3">
              {[
                { key: "title",       label: "Certificate Title", type: "text",  placeholder: "e.g. AWS Cloud Practitioner" },
                { key: "issuedBy",    label: "Issued By",         type: "text",  placeholder: "e.g. Amazon, Coursera"       },
                { key: "issuedDate",  label: "Issue Date",        type: "date",  placeholder: ""                            },
                { key: "description", label: "Description",       type: "text",  placeholder: "Brief description"           },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500 transition"
                  />
                </div>
              ))}
              <button
                onClick={handleAdd}
                className="w-full bg-green-900 hover:bg-green-800 text-white
                           font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Add Certification
              </button>
            </div>
          </div>

          {/* Certs List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              My Certifications ({certs.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : certs.length === 0 ? (
              <p className="text-gray-400 text-sm">No certifications added yet.</p>
            ) : (
              certs.map((c) => (
                <div key={c._id}
                     className="flex items-start justify-between p-3
                                bg-gray-50 rounded-xl mb-3">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center
                                    justify-center text-green-700 text-lg shrink-0">
                      🏅
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-400">
                        {c.issuedBy} · {c.uploadedMonth}
                      </p>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-400 hover:text-red-600 text-xs ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}