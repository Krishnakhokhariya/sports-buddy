import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { handleEnterKey } from "../utils/keypress";
import usePopup from "../hooks/usePopup.jsx";

import { getAllSports } from "../utils/sports";
import { getAllCities } from "../utils/cities";
import { getAreasByCity } from "../utils/areas";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { showPopup, popupElement } = usePopup();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);
  const [skill, setSkill] = useState("");

  const [sports, setSports] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const s = await getAllSports();
        const c = await getAllCities();
        if (!mounted) return;
        setSports(s || []);
        setCities(c || []);
      } finally {
        if (mounted) setLoadingDropdowns(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!city) {
      setAreas([]);
      setArea("");
      return;
    }

    let mounted = true;

    async function loadAreas() {
      const list = await getAreasByCity(city);
      if (!mounted) return;
      setAreas(list || []);

      if (!list.find((a) => a.name === area)) {
        setArea("");
      }
    }
    loadAreas();

    return () => (mounted = false);
  }, [city]);

  function toggleSport(sport) {
    setSelectedSports((prev) =>
      prev.includes(sport)
        ? prev.filter((x) => x !== sport)
        : [...prev, sport]
    );
  }


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const sportInterest = selectedSports.join(",");

      await signup(
        name.trim(),
        email.trim(),
        password,
        sportInterest,
        city,
        skill,
        area
      );
      await showPopup("Account created successfully! Please log in.");

      navigate("/login");
    } catch (err) {
      await showPopup(`Failed to create account: ${err.message}`);
    }

    setLoading(false);
  }

  return (
    <>
      <AuthCard
        title="Create Account"
        subtitle="Sign up to join local games and teammates"
        footer={
          <p>
            Already have an account?
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
              className="border rounded-md p-3 focus:ring-2 focus:ring-primary"
              placeholder="Full Name"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
              className="border rounded-md p-3 focus:ring-2 focus:ring-primary"
              placeholder="Email"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
              className="border rounded-md p-3 focus:ring-2 focus:ring-primary"
              placeholder="Password"
              required
            />

            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="border rounded-md p-3 focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border rounded-md p-3"
              required
            >
              <option value="">Select City</option>

              {loadingDropdowns ? (
                <option disabled>Loading...</option>
              ) : (
                cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              )}
            </select>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border rounded-md p-3"
              required
              disabled={!city}
            >
              <option value="">
                {city ? "Select Area" : "Select city first"}
              </option>

              {areas.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm mb-2 block">Sports (choose one or more)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sports.map((s) => {
                const checked = selectedSports.includes(s.name);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 border p-2 rounded cursor-pointer ${
                      checked ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSport(s.name)}
                    />
                    <span>{s.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </AuthCard>

      {popupElement}
    </>
  );
}
