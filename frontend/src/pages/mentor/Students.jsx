import { useEffect, useState } from "react";
import Sidebar                 from "../../components/Sidebar";
import API                     from "../../api";
import { MousePointerClick, Award, Trophy } from "lucide-react";

export default function MentorStudents() {
  const [students,      setStudents]      = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [details,       setDetails]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    API.get("/mentor/students")
      .then((res) => setStudents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const viewStudent = async (id) => {
    try {
      setDetailLoading(true);
      setSelected(id);
      const res = await API.get(`/mentor/students/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">My Students</h2>
        <p className="text-gray-400 text-sm mb-6">
          View and manage your assigned students.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Students List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Assigned Students ({students.length})
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : students.length === 0 ? (
              <p className="text-gray-400 text-sm">No students assigned yet.</p>
            ) : (
              students.map((s) => (
                <div
                  key={s._id}
                  onClick={() => viewStudent(s._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                              transition mb-2
                    ${selected === s._id
                      ? "bg-green-900 text-white"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center
                                   justify-center font-bold text-sm shrink-0
                    ${selected === s._id
                      ? "bg-green-700 text-white"
                      : "bg-green-100 text-green-800"
                    }`}>
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-sm font-medium
                      ${selected === s._id ? "text-white" : "text-gray-800"}`}>
                      {s.name}
                    </p>
                    <p className={`text-xs
                      ${selected === s._id ? "text-green-200" : "text-gray-400"}`}>
                      {s.rollNo} · {s.branch} {s.section}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-8 text-center h-full flex items-center
                              justify-center">
                <div>
                  <MousePointerClick
                    size={36}
                    className="text-gray-300 mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-gray-400">Select a student to view details</p>
                </div>
              </div>
            ) : detailLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-8 text-center">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : details ? (
              <div className="space-y-4">

                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 mb-4">Student Info</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Name",      value: details.student?.name },
                      { label: "Email",     value: details.student?.email },
                      { label: "Roll No",   value: details.student?.rollNo },
                      { label: "Branch",    value: details.student?.branch },
                      { label: "Section",   value: details.student?.section },
                      { label: "Semester",  value: details.student?.semester },
                      { label: "Phone",     value: details.student?.personalInfo?.phone },
                      { label: "Parent",    value: details.student?.personalInfo?.parentName },
                      { label: "Parent Ph", value: details.student?.personalInfo?.parentPhone },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-800">
                          {value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Records */}
                {details.academicRecords?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">Academic Records</h3>
                    {details.academicRecords.map((r) => {
                      const pct = Math.round(
                        ((r.midExamMarks.obtained + r.semExamMarks.obtained) /
                         (r.midExamMarks.total    + r.semExamMarks.total)) * 100
                      );
                      return (
                        <div key={r._id} className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">{r.subject}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">
                                Att: {r.attendancePercent}%
                              </span>
                              <span className={`font-bold
                                ${pct >= 75 ? "text-green-600" :
                                  pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-1.5 rounded-full
                                ${pct >= 75 ? "bg-green-500" :
                                  pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Certifications */}
                {details.student?.certifications?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-3">Certifications</h3>
                    {details.student.certifications.map((c) => (
                      <div key={c._id}
                           className="flex items-center gap-3 py-2 border-b
                                      border-gray-50 last:border-0">
                        <Award
                          size={20}
                          className="text-amber-500 shrink-0"
                          strokeWidth={1.8}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.title}</p>
                          <p className="text-xs text-gray-400">
                            {c.issuedBy} · {c.uploadedMonth}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Awards */}
                {details.student?.awards?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-3">Awards & Achievements</h3>
                    {details.student.awards.map((a) => (
                      <div key={a._id}
                           className="flex items-center gap-3 py-2 border-b
                                      border-gray-50 last:border-0">
                        <Trophy
                          size={20}
                          className="text-yellow-500 shrink-0"
                          strokeWidth={1.8}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.title}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {a.type} · {a.month}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}