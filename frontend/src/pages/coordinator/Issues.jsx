import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function CoordIssues() {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState("");
  const [filter,  setFilter]  = useState("open");
  const [resolving, setResolving] = useState({});
  const [resolutions, setResolutions] = useState({});

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/coordinator/issues${filter !== "all" ? `?status=${filter}` : ""}`
      );
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleResolve = async (id) => {
    if (!resolutions[id]) {
      return setMsg("Please type a resolution first");
    }
    try {
      setResolving({ ...resolving, [id]: true });
      await API.put(`/coordinator/issues/${id}/resolve`, {
        resolution: resolutions[id],
      });
      setMsg("Issue resolved ✅");
      fetchIssues();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed");
    } finally {
      setResolving({ ...resolving, [id]: false });
    }
  };

  const priorityColor = (p) => ({
    high:   "bg-red-100    text-red-700",
    medium: "bg-amber-100  text-amber-700",
    low:    "bg-gray-100   text-gray-600",
  }[p]);

  const statusColor = (s) => ({
    open:       "bg-red-100   text-red-700",
    inprogress: "bg-blue-100  text-blue-700",
    resolved:   "bg-green-100 text-green-700",
  }[s]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Issues</h2>
        <p className="text-gray-400 text-sm mb-6">
          Review and resolve issues raised by mentors.
        </p>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border
            ${msg.includes("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"}`}>
            {msg}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["all","open","inprogress","resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border
                          transition capitalize
                ${filter === s
                  ? "bg-green-900 text-white border-green-900"
                  : "bg-white text-gray-500 border-gray-200"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Issues List */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-8 text-center text-gray-400">
            No {filter} issues found.
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue._id}
                 className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      font-medium ${priorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      font-medium ${statusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{issue.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Raised by: {issue.raisedBy?.name} ·
                    Student: {issue.student?.name || "N/A"} ·
                    {new Date(issue.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              {issue.description && (
                <p className="text-sm text-gray-600 mb-3 bg-gray-50
                              rounded-xl px-4 py-3">
                  {issue.description}
                </p>
              )}

              {issue.status === "resolved" ? (
                <div className="bg-green-50 border border-green-100
                                rounded-xl px-4 py-3">
                  <p className="text-xs text-green-600 mb-1">Resolution:</p>
                  <p className="text-sm text-gray-700">{issue.resolution}</p>
                </div>
              ) : (
                <div className="flex gap-3 mt-3">
                  <input
                    type="text"
                    placeholder="Type resolution..."
                    value={resolutions[issue._id] || ""}
                    onChange={(e) => setResolutions({
                      ...resolutions, [issue._id]: e.target.value,
                    })}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                  <button
                    onClick={() => handleResolve(issue._id)}
                    disabled={resolving[issue._id]}
                    className="px-4 py-2 bg-green-900 hover:bg-green-800
                               text-white text-sm rounded-xl transition
                               disabled:opacity-60 shrink-0"
                  >
                    {resolving[issue._id] ? "Resolving..." : "Resolve"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}