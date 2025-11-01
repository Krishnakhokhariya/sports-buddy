import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      alert("Logged in successfully!");
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to find local Games and Teammates"
      footer={
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary">
            Register
          </Link>
        </p>
      }
    >
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none block w-full"
          placeholder="Email"
          required
        />
        <input
          type="password"
          aria-label="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="Password"
          required
        />
        <div className="flex flex-col gap-4 justify-center items-center text-sm">
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md px-4 focus:ring-2 focus:ring-primary"
             disabled={loading}
          >
            Login
          </button>
          <Link to="/reset-password" className="text-primary">
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthCard>

    // <div>
    //   <h2>Login</h2>
    //   {error && <div style={{color:"red"}}>{error}</div>}
    //   <form onSubmit={handleSubmit}>
    //     <input type="email" placeholder='Email' value={email} onChange={e=> setEmail(e.target.value)} />
    //     <input type="password" placeholder='Password' value={password} onChange={e=> setPassword(e.target.value)} />
    //     <button type="submit" disabled={loading}>Login</button>
    //     <p><button type="button" onClick={() => navigate("/reset-password")} style={{border:"none", background:"none", color:"blue",cursor:"pointer"}}>Forgot Password?</button></p>
    //   </form>
    //   <p>Don't have an account? <Link to = "/register">Register</Link></p>
    // </div>
  );
}
