import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Password reset link sent to your email!");
    } catch (err) {
      setError(`Failed to send reset email: ${err.message} `);
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Check your mailbox to set new password"
      footer={
        <p>
          <Link to="/login" className="text-primary">
            Back to Login
          </Link>
        </p>
      }
    >
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
         <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter your Registered email"
          required
        />
        <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md px-4 focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            Send Reset Link
          </button>
      </form>
    </AuthCard>
  );
}
