// src/components/dashboard/Marketplace.jsx
import { useTasks } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import { Star, Briefcase, TrendingUp } from "lucide-react";

export default function Marketplace() {
  const { tasks, agents } = useTasks();
  const { user } = useAuth();

  // Only show tasks posted by agents
  const marketplaceTasks = tasks.filter(t => t.type === "marketplace" && t.status === "open");

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Marketplace</h2>

      {/* Agent List */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-xl shadow-sm p-5 border hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{agent.name}</h4>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{agent.rating}</span>
                  <span className="text-gray-500">• {agent.tasks} tasks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent-Posted Tasks */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Tasks from Agents
        </h3>

        {marketplaceTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
            No agent-posted tasks available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-600">${task.budget}</span>
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition">
                    {user.role === "client" ? "Hire" : "View"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">by {task.postedByName} (Agent)</p>
              </div>
            ))}
          </div>
        )}

        {/* Optional: Add Agent Posting Button (for agents only) */}
        {user.role === "agent" && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-medium">
              <Plus className="w-5 h-5" />
              Post New Task
            </button>
          </div>
        )}
      </section>
    </div>
  );
}