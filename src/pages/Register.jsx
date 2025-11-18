import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [sportInterest, setSportIntrest] = useState("");
  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password, sportInterest, city, skill);
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(`Failed to create account: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Sign up to join local games and teammates"
      footer={
        <p>
          Already have an account?
          <Link to="/login" className="text-primary">
            Login
          </Link>
        </p>
      }
    >
       {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      
        <input
          type="text"
          aria-label="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
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

        <input
          type="text"
          aria-label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="City"
          required
        />

        <input
          type="text"
          aria-label="SportInterest"
          value={sportInterest}
          onChange={(e) => setSportIntrest(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="SportsInterest (e.g. Football, Cricket)"
          required
        />

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          required
        >
          <option value="">Select skill level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>


        <div className="flex flex-col gap-4 justify-center items-center text-sm">
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md px-4 focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            Register
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
