// src/context/TaskContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // eslint-disable-next-line no-unused-vars
  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem("agents");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "1", name: "Alex Johnson", rating: 4.9, tasks: 142 },
          { id: "2", name: "Sarah Lee", rating: 4.7, tasks: 98 },
          { id: "3", name: "Mike Chen", rating: 5.0, tasks: 201 },
        ];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("agents", JSON.stringify(agents));
  }, [agents]);

  const addTask = (task, user) => {
    const newTask = {
      id: Date.now().toString(),
      ...task,
      postedBy: user.id,
      postedByName: user.name,
      postedByRole: user.role,        // ← client or agent
      type: user.role === "agent" ? "marketplace" : "client", // ← key
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, agents, addTask, updateTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => useContext(TaskContext);