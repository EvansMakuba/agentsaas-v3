import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Swarm Engage</h1>
      <p className="text-gray-600 mb-6">
        Collaborate seamlessly — Clients and Executors in one ecosystem.
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
