import { useAuth } from "../context/AuthContext";

export default function ExecutorDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-2">Role: {user.role}</p>
      <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded mt-4">
        Logout
      </button>
    </div>
  );
}
