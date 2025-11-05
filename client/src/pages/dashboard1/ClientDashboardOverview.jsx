// src/components/client/ClientDashboardOverview.jsx
import { useTasks } from "../../context/TaskContext";

export default function ClientDashboardOverview({ user }) {
  const { tasks } = useTasks();
  const myTasks = tasks.filter(t => t.postedBy === user.id);
  const openTasks = myTasks.filter(t => t.status === "open").length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user.name.split(" ")[0]}!
      </h1>
      <p className="text-gray-600 mb-8">Manage your projects with ease.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mb-4" />
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{myTasks.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 mb-4" />
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{openTasks}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 mb-4" />
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {myTasks.filter(t => t.status === "completed").length}
          </p>
        </div>
      </div>
    </div>
  );
}