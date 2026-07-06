import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function MentorReport() {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg,      setMsg]      = useState("");
  const [form,     setForm]     = useState({
    weekStartDate: "",
    weekEndDate:   "",
  });

  const fetchReports = useCallback(async () => {
    try {
      const res = await API.get("/mentor/weekly-reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleGenerate = async () => {
    if (!form.weekStartDate || !form.weekEndDate) {
      return setMsg("Please select week start and end dates");
    }
    try {
      setGenerating(true);
      await API.post("/mentor/weekly-report", form);
      setMsg("Report generated ✅");
      fetchReports();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await API.get(`/mentor/weekly-report/${id}/pdf`, {
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `weekly-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Weekly Reports</h2>
        <p className="text-gray-400 text-sm mb-6">
          Generate and download your weekly mentoring reports.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Generate Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Generate New Report</h3>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Week Start Date
              </label>
              <input
                type="date"
                value={form.weekStartDate}
                onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Week End Date
              </label>
              <input
                type="date"
                value={form.weekEndDate}
                onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2 bg-green-900 hover:bg-green-800 text-white
                           font-medium rounded-xl text-sm transition-all
                           disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">My Reports</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : reports.length === 0 ? (
            <p className="text-gray-400 text-sm">No reports generated yet.</p>
          ) : (
            reports.map((r) => (
              <div key={r._id}
                   className="flex items-center justify-between p-4
                              bg-gray-50 rounded-xl mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(r.weekStartDate).toDateString()} —{" "}
                    {new Date(r.weekEndDate).toDateString()}
                  </p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>Students: {r.totalStudents}</span>
                    <span className="text-green-600">
                      Present: {r.presentCount}
                    </span>
                    <span className="text-red-600">
                      Absent: {r.absentCount}
                    </span>
                    <span className="text-amber-600">
                      Low Att: {r.lowAttendanceCount}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(r._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-900
                             hover:bg-green-800 text-white text-xs rounded-xl
                             transition"
                >
                  📥 Download PDF
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}