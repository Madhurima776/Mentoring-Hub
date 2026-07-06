import { useState }    from "react";
import Sidebar         from "../../components/Sidebar";
import API             from "../../api";

export default function AdminUpload() {
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first.");
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await API.post("/admin/upload-users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Bulk Upload Users</h2>
        <p className="text-gray-400 text-sm mb-6">
          Upload a CSV or Excel file to create multiple users at once.
        </p>

        {/* Format Guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">
            📋 Required File Format
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            Your CSV/Excel must have these column headers:
          </p>
          <div className="overflow-x-auto">
            <table className="text-xs text-blue-800 w-full">
              <thead>
                <tr className="border-b border-blue-200">
                  {["name","email","role","department","branch",
                    "section","semester","batch","rollNo","employeeId"
                  ].map((h) => (
                    <th key={h} className="text-left py-1 pr-4 font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["Ravi Kumar","ravi@svecw.edu.in","student","CSE",
                    "CSE","A","4","2022-26","22CS001",""
                  ].map((v, i) => (
                    <td key={i} className="py-1 pr-4 text-blue-600">{v}</td>
                  ))}
                </tr>
                <tr>
                  {["Dr. Priya","priya@svecw.edu.in","mentor","CSE",
                    "CSE","","","","","FAC001"
                  ].map((v, i) => (
                    <td key={i} className="py-1 pr-4 text-blue-600">{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            ⚠️ Default password = rollNo (students) or employeeId (faculty).
            Users must change password on first login.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-10
                       text-center cursor-pointer hover:border-green-400
                       hover:bg-green-50 transition-all"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <p className="text-4xl mb-3">📤</p>
            <p className="text-gray-600 font-medium">
              {file ? file.name : "Click to select file"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Supports .csv and .xlsx
            </p>
            <input
              id="fileInput"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setResult(null);
                setError("");
              }}
            />
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600
                            text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="mt-4 w-full bg-green-900 hover:bg-green-800 text-white
                       font-medium py-2.5 rounded-xl text-sm transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Uploading...
              </>
            ) : "Upload File"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Upload Result</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                <p className="text-sm text-green-600">Created</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
                <p className="text-sm text-amber-600">Skipped</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                <p className="text-sm text-red-600">Failed</p>
              </div>
            </div>
            {result.details?.failed?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Failed rows:</p>
                {result.details.failed.map((f, i) => (
                  <div key={i} className="text-xs text-red-600 bg-red-50
                                          px-3 py-2 rounded-lg mb-1">
                    {f.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}