import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { handleEnterKey } from "../utils/keypress";
import usePopup from "../hooks/usePopup";


export default function Login() {
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {showPopup, popupElement} = usePopup();
  

  async function handleSubmit(e = null) {
    if(e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      
    } catch (err) {
      await showPopup("Invalid email or password")
      // setError("Invalid email or password");
    }
    setLoading(false);
  }

  useEffect(()=>{
    if(profile){
      if(profile.role === 'admin'){
        navigate("/admin");
      } else{
        navigate("/dashboard");
      }
    }
  }, [profile, navigate]);

  return (
    <>
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
          onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none block w-full"
          placeholder="Email"
          required
        />
        <input
          type="password"
          aria-label="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
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
      {popupElement}
    </>
  );
}
