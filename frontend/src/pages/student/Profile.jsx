import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API     from "../../api";

export default function StudentProfile() {
  const [profile,  setProfile]    = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [msg,      setMsg]        = useState("");
  const [error,    setError]      = useState("");
  const [form,     setForm]       = useState({
    personalInfo: {
      phone: "", dob: "", gender: "", address: "",
      parentName: "", parentPhone: "", parentEmail: "", bloodGroup: "",
    },
    extraCurricular: [],
  });
  const [newActivity, setNewActivity] = useState({ activity: "", description: "" });

  useEffect(() => {
    API.get("/student/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({
          personalInfo:    res.data.personalInfo    || {},
          extraCurricular: res.data.extraCurricular || [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await API.put("/student/profile", form);
      setMsg("Profile updated successfully ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const addActivity = () => {
    if (!newActivity.activity) return;
    setForm({
      ...form,
      extraCurricular: [...form.extraCurricular, newActivity],
    });
    setNewActivity({ activity: "", description: "" });
  };

  const removeActivity = (i) => {
    setForm({
      ...form,
      extraCurricular: form.extraCurricular.filter((_, idx) => idx !== i),
    });
  };

  if (loading) return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">

        <h2 className="text-xl font-bold text-gray-800 mb-1">My Profile</h2>
        <p className="text-gray-400 text-sm mb-6">
          View and update your personal information.
        </p>

        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          text-sm px-4 py-3 rounded-xl mb-4">{msg}</div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {/* Read-only info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Academic Info
            <span className="ml-2 text-xs text-gray-400 font-normal">
              (cannot be changed)
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Full Name",   value: profile?.name       },
              { label: "Email",       value: profile?.email      },
              { label: "Roll No",     value: profile?.rollNo     },
              { label: "Department",  value: profile?.department },
              { label: "Branch",      value: profile?.branch     },
              { label: "Section",     value: profile?.section    },
              { label: "Semester",    value: profile?.semester   },
              { label: "Batch",       value: profile?.batch      },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "phone",       label: "Phone",        type: "text"   },
              { key: "dob",         label: "Date of Birth",type: "date"   },
              { key: "bloodGroup",  label: "Blood Group",  type: "text"   },
              { key: "address",     label: "Address",      type: "text"   },
              { key: "parentName",  label: "Parent Name",  type: "text"   },
              { key: "parentPhone", label: "Parent Phone", type: "text"   },
              { key: "parentEmail", label: "Parent Email", type: "email"  },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type={type}
                  value={form.personalInfo?.[key] || ""}
                  onChange={(e) => setForm({
                    ...form,
                    personalInfo: { ...form.personalInfo, [key]: e.target.value },
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500 transition"
                />
              </div>
            ))}

            {/* Gender */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gender</label>
              <select
                value={form.personalInfo?.gender || ""}
                onChange={(e) => setForm({
                  ...form,
                  personalInfo: { ...form.personalInfo, gender: e.target.value },
                })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-green-500 transition"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Extra Curricular */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Extra Curricular Activities</h3>

          {form.extraCurricular.map((ec, i) => (
            <div key={i}
                 className="flex items-center justify-between p-3 bg-gray-50
                            rounded-xl mb-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{ec.activity}</p>
                <p className="text-xs text-gray-400">{ec.description}</p>
              </div>
              <button
                onClick={() => removeActivity(i)}
                className="text-red-400 hover:text-red-600 text-xs ml-4"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Activity name"
              value={newActivity.activity}
              onChange={(e) => setNewActivity({ ...newActivity, activity: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200
                         text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200
                         text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addActivity}
              className="px-4 py-2 bg-green-900 text-white rounded-xl text-sm"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-900 hover:bg-green-800 text-white font-medium
                     py-2.5 rounded-xl text-sm transition-all disabled:opacity-60
                     flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </main>
    </div>
  );
}