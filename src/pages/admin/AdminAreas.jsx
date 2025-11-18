import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllCities } from "../../utils/cities";
import { addLog } from "../../utils/logs";
import { createArea, getAllAreas, updateArea, deleteArea } from "../../utils/areas";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function AdminAreas() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCity, setEditingCity] = useState("");

  useEffect(() => {
    async function load() {
      setCities(await getAllCities());
      setAreas(await getAllAreas());
      setLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId ? !editingName.trim() || !editingCity : !name.trim() || !city) return;

    try {
      if (editingId) {
        await updateArea(editingId, { name: editingName, city: editingCity });
        await addLog({
          actorUid: profile.uid,
          action: "update_area",
          targetCollection: "areas",
          targetId: editingId,
          details: { name: editingName },
        });
      } else {
        const id = await createArea({ name: name.trim(), city });
        await addLog({
          actorUid: profile.uid,
          action: "create_area",
          targetCollection: "areas",
          targetId: id,
          details: { name },
        });
      }
      setName(""); setCity(""); setEditingId(null); setEditingName("");
      setAreas(await getAllAreas());
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete '${label}'?`)) return;
    await deleteArea(id);
    setAreas(await getAllAreas());
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow w-full max-w-5xl mx-auto">
     
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> Back
      </button>

      <h2 className="text-xl text-center font-semibold mb-4">Manage Areas</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={editingId ? editingName : name}
          onChange={(e) => (editingId ? setEditingName(e.target.value) : setName(e.target.value))}
          placeholder="Enter name"
          className="flex-1 border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <select
          className="border p-2 rounded"
          value={editingId ? editingCity : city}
          onChange={(e) => (editingId ? setEditingCity(e.target.value) : setCity(e.target.value))}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setEditingName(""); }}
            className="border px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : areas.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <ul className="space-y-2">
          {areas.map((a) => (
            <li key={a.id} className="flex flex-row justify-between border p-3 rounded gap-2">
              <span>{a.name} - <span className="text-gray-500 text-sm">{a.city}</span></span>
              <div className="opacity-80 group-hover:opacity-100 flex gap-2 justify-end transition">

                    <button
                      onClick={() => { setEditingId(a.id); setEditingName(a.name); setEditingCity(a.city); }}
                      className="text-blue-600 hover:scale-125 transition"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(a.id, a.name)}
                      className="text-red-600 hover:scale-125 transition"
                      title="Delete"
                    >
                     <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
              
              {/* <div className="flex gap-3">
                <button onClick={() => { setEditingId(a.id); setEditingName(a.name); setEditingCity(a.city); }} 
                        className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(a.id, a.name)} 
                        className="text-red-600 hover:underline">Delete</button>
              </div> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminAreas;
