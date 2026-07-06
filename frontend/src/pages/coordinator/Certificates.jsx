import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";
import { Download, Award } from "lucide-react";


export default function CoordCertificates() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [month,   setMonth]   = useState("");
  const [downloading, setDownloading] = useState(false);

  const fetchCerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = month ? { month } : {};
      const res = await API.get("/coordinator/certificates", { params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const params = month ? { month } : {};
      const res = await API.get("/coordinator/certificates/pdf", {
        params,
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `certificates-${month || "all"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // Generate month options
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toLocaleString("default", { month: "long", year: "numeric" }));
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Student Certificates
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          View and download all student certifications by month.
        </p>

        {/* Filter + Download */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                        p-4 mb-6 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Filter by Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2 bg-green-900
                       hover:bg-green-800 text-white text-sm font-medium
                       rounded-xl transition disabled:opacity-60"
          >
            {downloading ? "Downloading..." :  <><Download size={14} strokeWidth={1.8} className="inline mr-1" /> Download PDF</>}
          </button>

          {data && (
            <div className="ml-auto text-sm text-gray-500">
              Total: <span className="font-bold text-gray-800">{data.total}</span> certifications
            </div>
          )}
        </div>

        {/* Certificates by Student */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : !data || data.students?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-8 text-center text-gray-400">
            No certifications found {month ? `for ${month}` : ""}.
          </div>
        ) : (
          data.students.map((s) => (
            <div key={s.studentId}
                 className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5 mb-4">
              <div className="flex items-center gap-3 mb-3 pb-3
                              border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-green-100 flex
                                items-center justify-center text-green-800
                                font-bold">
                  {s.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.rollNo} · {s.branch} {s.section}
                  </p>
                </div>
                <span className="ml-auto bg-green-100 text-green-700 text-xs
                                 px-2 py-0.5 rounded-full font-medium">
                  {s.certifications.length} cert(s)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {s.certifications.map((c, i) => (
                  <div key={i}
                       className="flex items-center gap-3 p-3 bg-gray-50
                                  rounded-xl">
                     <Award size={20} className="text-amber-500 shrink-0" strokeWidth={1.8} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.issuedBy} · {c.uploadedMonth}
                      </p>
                      {c.description && (
                        <p className="text-xs text-gray-400">{c.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}