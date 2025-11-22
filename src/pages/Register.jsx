import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { handleEnterKey } from "../utils/keypress";

import { getAllSports } from "../utils/sports";
import { getAllCities } from "../utils/cities";
import { getAreasByCity } from "../utils/areas";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);


  useEffect(() =>{
    let mounted = true;
    async function load(){
      try{
        setLoadingDropdowns(true);

        const s = await getAllSports();
        const c =  await getAllCities();

        if(!mounted) return;
        setSports(s || []);
        setCities(c || []);
      } catch(err){
        console.error("Failed to load dropdown data:", err);
      } finally {
        if(mounted) setLoadingDropdowns(false);
      }
    }
    load();
    return () => { mounted = false; };
  },[]);

  useEffect(() =>{
    if(!city){
      setAreas([]);
      setArea("");
      return;
    }
    let mounted = true;
    async function loadAreas() {
      try{
        const list = await getAreasByCity(city);
        if(!mounted) return;
        setAreas(list || []);

        if(!list.find(a => a.name === area)){
          setArea("");
        }
      } catch(err){
        console.error("Failed to load areas for city", city, err);
        if(mounted)  setAreas([]);
      }
    }
    loadAreas();
    return () => { mounted = false; };
  }, [city]);

  function toggelSport(sportName){
    setSelectedSports(prev =>
      prev.includes(sportName)
      ? prev.filter(s => s != sportName)
      :[...prev, sportName]
    );
  }

  async function handleSubmit(e = null) {
    if(e) e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sportInterest = selectedSports.join(",");
      await signup(name.trim(), email.trim(), password, sportInterest, city, skill, area);
      
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
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      }
    >
       {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          aria-label="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
           onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
           onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
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

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
           onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
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
             onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
            required
          >
            <option value="">Select City</option>
            {loadingDropdowns ? (
              <option disabled>Loading cities...</option>
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
          onChange={(e)=> setArea(e.target.value)}
           onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="border rounded-md p-3 focus:ring-2 focus:ring-primary outline-none"
          required
          disabled={!city || areas.length === 0}>
            <option value="">{city ? "select area" : "select city first"}</option>
            {areas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sports (choose one or more)</label>
        {loadingDropdowns ? (
          <p className="text-sm text-gray-500">Loading sports...</p>
        ): sports.length === 0 ? (
          <p className="text-sm text-gray-500">No sports available.</p>
        ): (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sports.map((s) => {
              const checked = selectedSports.includes(s.name);
              return(
                <label
                key={s.id}
                className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer select-none ${
                      checked ? "bg-primary/10 border-primary" : ""
                    }`}>
                      <input type="checkbox"
                      checked={checked} 
                      onChange={() => toggelSport(s.name)}
                      className="w-4 h-4"/>
                      <span className="text-sm">{s.name}</span>
                    </label>
              )
            })}
          </div>
        )}
      </div>

  
        <div className="flex flex-col gap-4 justify-center items-center text-sm">
          <button
            type="submit"
            className="bg-primary text-white py-2 rounded-md px-4 focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
             {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
