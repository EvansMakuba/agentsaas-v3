// src/components/client/MyTasks.jsx
import { useTasks } from "../../context/TaskContext";

export default function MyTasks({ userId }) {
  const { tasks } = useTasks();
  const myTasks = tasks.filter(t => t.postedBy === userId);

  if (myTasks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>You haven't posted any tasks yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Posted Tasks</h2>
      <div className="space-y-4">
        {myTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.status === "open" ? "bg-green-100 text-green-800" :
                task.status === "in-progress" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {task.status}
              </span>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="font-bold text-indigo-600">${task.budget}</span>
              <span className="text-gray-500">Posted {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}