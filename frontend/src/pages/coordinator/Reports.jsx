import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";
import { Download } from "lucide-react";

export default function CoordReports() {
  const [reports,  setReports]  = useState([]);
  const [pending,  setPending]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [weekDate, setWeekDate] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const params = weekDate ? { weekStartDate: weekDate } : {};
      const res = await API.get("/coordinator/weekly-reports", { params });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [weekDate]);

  const fetchPending = useCallback(async () => {
    if (!weekDate) return;
    try {
      const res = await API.get(
        `/coordinator/pending-reports?weekStartDate=${weekDate}`
      );
      setPending(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [weekDate]);

  useEffect(() => {
    fetchReports();
    fetchPending();
  }, [fetchReports, fetchPending]);

  const handleDownload = async (id) => {
    try {
      const res = await API.get(
        `/coordinator/weekly-reports/${id}/pdf`,
        { responseType: "blob" }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `report-${id}.pdf`);
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
          View and download all mentor weekly reports.
        </p>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-6 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Filter by Week Start Date
            </label>
            <input
              type="date"
              value={weekDate}
              onChange={(e) => setWeekDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {weekDate && (
            <button
              onClick={() => setWeekDate("")}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200
                         rounded-xl hover:bg-gray-50 transition"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Pending Alert */}
        {pending && pending.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">
              ⚠️ {pending.pending} Mentor(s) Haven't Submitted Report
            </h3>
            <div className="flex flex-wrap gap-2">
              {pending.pendingMentors?.map((m) => (
                <span key={m._id}
                      className="bg-white border border-amber-200 text-amber-700
                                 text-sm px-3 py-1 rounded-full">
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-8 text-center text-gray-400">
              Loading...
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-8 text-center text-gray-400">
              No reports found.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r._id}
                   className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.mentor?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(r.weekStartDate).toDateString()} —{" "}
                      {new Date(r.weekEndDate).toDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(r._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-900
                               hover:bg-green-800 text-white text-xs rounded-xl
                               transition"
                  >
                    <><Download size={14} strokeWidth={1.8} /> Download PDF</>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total",    value: r.totalStudents,      color: "gray"   },
                    { label: "Present",  value: r.presentCount,       color: "green"  },
                    { label: "Absent",   value: r.absentCount,        color: "red"    },
                    { label: "Low Att.", value: r.lowAttendanceCount, color: "amber"  },
                  ].map(({ label, value, color }) => (
                    <div key={label}
                         className={`bg-${color}-50 border border-${color}-100
                                     rounded-xl p-3 text-center`}>
                      <p className={`text-xl font-bold text-${color}-700`}>
                        {value}
                      </p>
                      <p className={`text-xs text-${color}-600`}>{label}</p>
                    </div>
                  ))}
                </div>

                {r.lowAttendanceStudents?.length > 0 && (
                  <div className="mt-3 bg-red-50 border border-red-100
                                  rounded-xl p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Low Attendance:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.lowAttendanceStudents.map((s) => (
                        <span key={s._id}
                              className="text-xs bg-white border border-red-200
                                         text-red-600 px-2 py-0.5 rounded-full">
                          {s.student?.name} ({s.attendancePercent}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}