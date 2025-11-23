import React, { useState, useEffect } from "react";
import { addEvent } from "../../utils/events";
import { useNavigate } from "react-router-dom";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { addLog } from "../../utils/logs";

import { getAllSports } from "../../utils/sports";
import { getAllCities } from "../../utils/cities";
import { getAreasByCity } from "../../utils/areas";
import { handleEnterKey } from "../../utils/keypress";

function EventForm({ existingEvent = null, onSubmitSuccess }) {
  const [loading, setLoading] = useState(false);

 
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");


  const [sports, setSports] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const { profile } = useAuth();
  const navigate = useNavigate();

 
  useEffect(() => {
    async function loadDropdowns() {
      const s = await getAllSports();
      const c = await getAllCities();
      setSports(s);
      setCities(c);

     
      if (existingEvent?.city) {
        const a = await getAreasByCity(existingEvent.city);
        setAreas(a);
      }
    }
    loadDropdowns();
  }, [existingEvent]);

  
  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title || "");
      setSport(existingEvent.sport || "");
      setDateTime(
        existingEvent.dateTime
          ? new Date(existingEvent.dateTime.seconds * 1000)
              .toISOString()
              .slice(0, 16)
          : ""
      );
      setCity(existingEvent.city || "");
      setArea(existingEvent.area || "");
      setSkill(existingEvent.skill || "");
      setDescription(existingEvent.description || "");
    }
  }, [existingEvent]);

  useEffect(() => {
    if (!city) {
      setAreas([]);
      setArea("");
      return;
    }

    async function fetchAreas() {
      const list = await getAreasByCity(city);
      setAreas(list);
      setArea(""); 
    }

    fetchAreas();
  }, [city]);

  async function handleSubmit(e = null) {
    console.log("Submitting event...");
    if(e) e.preventDefault();
    setLoading(true);

    try {
      if (!profile) throw new Error("You must be logged in");

      const eventData = {
        title,
        sport,
        dateTime: dateTime ? Timestamp.fromDate(new Date(dateTime)) : null,
        city,
        area,
        skill,
        description,
        updatedAt: Timestamp.now(),
      };

      if (existingEvent) {
        const eventRef = doc(db, "events", existingEvent.id);
        await updateDoc(eventRef, eventData);

        await addLog({
          actorUid: profile.uid,
          action: "Update_event",
          targetCollection: "events",
          targetId: existingEvent.id,
          details: {
            title: eventData.title,
            city: eventData.city,
            area: eventData.area,
          },
        });
      } else {
        const newEvent = {
          ...eventData,
          createdBy: profile.uid,
          attendees: [],
        };
        const newId = await addEvent(newEvent);

        await addLog({
          actorUid: profile.uid,
          action: "create_event",
          targetCollection: "events",
          targetId: newId,
          details: {
            title: eventData.title,
            city: eventData.city,
            area: eventData.area,
          },
        });
      }

      if (onSubmitSuccess) onSubmitSuccess();
      else navigate("/events");
    } catch (err) {
      console.error("Error saving event: ", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-auto no-scrollbar">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>

        <form
          onSubmit={handleSubmit}
          //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
          className="max-w-xl mx-auto p-4 flex flex-col space-y-4 bg-white rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-heading text-primary text-center mb-2">
            {existingEvent ? "Edit Event" : "Create New Event"}
          </h2>

          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
          />

          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
          >
            <option value="">Select Sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
          />

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
            disabled={!city}
          >
            <option value="">
              {city ? "Select Area" : "Select a city first"}
            </option>

            {areas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Select skill level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            //  onKeyDown={(e) => handleEnterKey(e, handleSubmit)}
            className="border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white p-2 rounded hover:bg-blue-600"
          >
            {loading
              ? existingEvent
                ? "Updating..."
                : "Creating..."
              : existingEvent
              ? "Update Event"
              : "Create Event"}
          </button>
        </form>
    </div>
  );
}

export default EventForm;
