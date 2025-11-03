import { useState } from "react";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setMessage("Error sending reset link", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        {message && <p className="text-green-500 text-sm mb-3">{message}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full hover:bg-blue-700">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
