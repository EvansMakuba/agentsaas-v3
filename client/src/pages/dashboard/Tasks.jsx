// src/components/dashboard/Tasks.jsx
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import { CheckSquare, Clock, DollarSign } from "lucide-react";

export default function Tasks() {
  const { tasks } = useTasks();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  // Only show tasks posted by clients
  const clientTasks = tasks.filter(t => t.type === "client" && t.status === "open");

  if (clientTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No open tasks from clients.</p>
        <p className="text-sm text-gray-400 mt-2">Check back later!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Client Tasks</h2>
      <div className="space-y-4">
        {clientTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Open
              </span>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{task.description}</p>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <strong className="text-green-600">${task.budget}</strong>
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                Apply Now
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">Posted by: {task.postedByName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}