export default function StatCard({ label, value, icon: Icon , color = "green" }) {
  const colors = {
    green:  "bg-green-50  text-green-600  border-green-100",
    blue:   "bg-blue-50   text-blue-600   border-blue-100",
    amber:  "bg-amber-50  text-amber-600  border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red:    "bg-red-50    text-red-600    border-red-100",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100
                    flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}