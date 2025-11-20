import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllSports } from "../utils/sports";
import { getAllCities } from "../utils/cities";
import { getAreasByCity } from "../utils/areas";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function ProfileEdit() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [skill, setSkill] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);

  const [sportsOptions, setSportsOptions] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load dropdown options
  useEffect(() => {
    async function loadOptions() {
      setSportsOptions(await getAllSports());
      setCities(await getAllCities());
    }
    loadOptions();
  }, []);

  // Load USER profile data only once
  useEffect(() => {
    if (!profile) return;

    async function loadUser() {
      const docRef = doc(db, "users", profile.uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return;

      const data = snap.data();

      setName(data.name || "");
      setSkill(data.skill || "");
      setCity(data.city || "");
      
      // Handle sports array or comma-separated string
      if (data.sports && Array.isArray(data.sports) && data.sports.length > 0) {
        setSelectedSports(data.sports);
      } else if (data.sportInterest) {
        // Split comma-separated string into array
        const sportsArray = typeof data.sportInterest === 'string'
          ? data.sportInterest.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];
        setSelectedSports(sportsArray);
      } else {
        setSelectedSports([]);
      }

      // Load areas and set selected area properly
      if (data.city) {
        const areaList = await getAreasByCity(data.city);
        setAreas(areaList);
        setArea(data.area || "");
      }

      setInitialLoaded(true);
    }

    loadUser();
  }, [profile]);

  // When user manually changes city
  useEffect(() => {
    if (!city) {
      setAreas([]);
      setArea("");
      return;
    }

    async function updateAreaList() {
      const list = await getAreasByCity(city);
      setAreas(list);

      // If initial load, keep saved area
      if (!initialLoaded) return;

      // If previously selected area does not exist, reset
      if (!list.find((a) => a.name === area)) {
        setArea("");
      }
    }

    updateAreaList();
  }, [city]);

  async function handleSave(e) {
    e.preventDefault();
    if (!profile) return alert("Login First");

    const userRef = doc(db, "users", profile.uid);

    await updateDoc(userRef, {
      name,
      city,
      area,
      skill,
      sports: selectedSports,
      sportInterest: selectedSports[0] || "",
    });

    alert("Profile updated successfully");
  }

  function toggleSport(s) {
    setSelectedSports((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="border p-2 rounded"
        />

        {/* CITY */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select city</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* AREA */}
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border p-2 rounded"
          disabled={!city}
        >
          <option value="">
            {city ? "Select area" : "Select city first"}
          </option>
          {areas.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>

        {/* SPORTS */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Select sports</div>
          <div className="flex flex-wrap gap-2">
            {sportsOptions.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSport(s.name)}
                className={`px-3 py-1 border rounded ${
                  selectedSports.includes(s.name)
                    ? "bg-primary text-white"
                    : ""
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* SKILL */}
        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select skill</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <button className="bg-primary text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}

export default ProfileEdit;
