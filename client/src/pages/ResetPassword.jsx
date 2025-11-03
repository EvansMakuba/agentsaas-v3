import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await resetPassword(token, { newPassword });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("Error resetting password", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        {message && <p className="text-green-500 text-sm mb-3">{message}</p>}
        <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full hover:bg-blue-700">
          Reset Password
        </button>
      </form>
    </div>
  );
}
