import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAllSports } from "../../utils/sports";
import { getAllCities } from "../../utils/cities";
import { getAllEvents, deleteEvent } from "../../utils/events";
import { getAreasByCity } from "../../utils/areas";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function AdminEvents() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [sports, setSports] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [filters, setFilers] = useState({
    sport: "",
    city: "",
    area: "",
  });

  useEffect(() => {
    async function load() {
      const EVENT = await getAllEvents();
      const SPORT = await getAllSports();
      const CITY = await getAllCities();

      setEvents(EVENT);
      setFilteredEvents(EVENT);
      setSports(SPORT);
      setCities(CITY);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadAreas() {
      if (!filters.city) {
        setAreas([]);
        return;
      }
      const area = await getAreasByCity(filters.city);
      setAreas(area);
    }
    loadAreas();
  }, [filters.city]);

  useEffect(() => {
    let list = [...events];

    if (filters.sport) {
      list = list.filter((e) => e.sport === filters.sport);
    }

    if (filters.city) {
      list = list.filter((e) => e.city === filters.city);
    }

    if (filters.area) {
      list = list.filter((e) => e.area === filters.area);
    }

    setFilteredEvents(list);
  }, [filters, events]);

  async function handleDelete(id, title) {
    if (!confirm(`Delete event '${title}'?`)) return;

    await deleteEvent(id, profile, title);

    setEvents(events.filter((e) => e.id !== id));
  }

  function clearFilters() {
    setFilers({
      sport: "",
      city: "",
      area: "",
    });
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <select
          className="border p-2 rounded w-full"
          value={filters.sport}
          onChange={(e) => setFilers({ ...filters, sport: e.target.value })}
        >
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full"
          value={filters.city}
          onChange={(e) => setFilers({ ...filters, city: e.target.value })}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full"
          value={filters.area}
          onChange={(e) => setFilers({ ...filters, area: e.target.value })}
        >
          <option value="">All Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
         <div className="flex justify-center w-full">
          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Clear Filter
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Sport</th>
              <th className="p-3">City</th>
              <th className="p-3">Area</th>
              <th className="p-3">Creator</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e) => (
            <tr
              key={e.id}
              className="border-t hover:bg-gray-50 group cursor-pointer"
              onClick={() => navigate(`/admin/events/${e.id}`)}
            >
              <td className="p-3">{e.title}</td>
              <td className="p-3">{e.sport}</td>
              <td className="p-3">{e.city}</td>
              <td className="p-3">{e.area}</td>
              <td className="p-3">{e.createdBy}</td>
               <td
                  className="p-3 text-right"
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <div className="opacity-80 group-hover:opacity-100 flex gap-2 justify-end transition">

                    <button
                      onClick={() => navigate(`/admin/events/edit/${e.id}`)}
                      className="text-blue-600 hover:scale-125 transition"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(e.id, e.title)}
                      className="text-red-600 hover:scale-125 transition"
                      title="Delete"
                    >
                     <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
            </tr>
            ))} 
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate("/admin/events/add")}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white text-3xl shadow-lg hover:bg-blue-700"
        title="Add Event"
      >
        +
      </button>
    </div>
  );
}

export default AdminEvents;
