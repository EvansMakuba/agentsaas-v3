import { CheckSquare, DollarSign, MessageCircle, Star } from "lucide-react";

export default function DashboardOverview({ user }) {
  const stats = [
    { label: "Active Tasks", value: "12", icon: CheckSquare, gradient: "from-blue-500 to-cyan-500" },
    { label: "Earnings", value: "$1,240", icon: DollarSign, gradient: "from-green-500 to-emerald-500" },
    { label: "Messages", value: "5", icon: MessageCircle, gradient: "from-purple-500 to-pink-500" },
    { label: "Rating", value: "4.8 stars", icon: Star, gradient: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome back, {user.name.split(" ")[0]}!
      </h1>
      <p className="text-gray-600 mb-8">Here’s what’s happening today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${s.gradient} mb-4`} />
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            "Completed task: Website Audit",
            "New message from Client X",
            "Earned $120",
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}