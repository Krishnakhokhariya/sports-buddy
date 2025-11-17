import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAllCities } from "../../utils/cities";
import { addLog } from "../../utils/logs";
import { createArea, getAllAreas, updateArea, deleteArea } from "../../utils/areas";

function AdminAreas() {
  const { profile } = useAuth();

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (editingId) {
      if (!editingName.trim() || !editingCity) return;
    } else {
      if (!name.trim() || !city) return;
    }

    try {
      if (editingId) {
        await updateArea(editingId, {
          name: editingName,
          city: editingCity,
        });

        await addLog({
          actorUid: profile.uid,
          action: "update_area",
          targetCollection: "areas",
          targetId: editingId,
          details: { name: editingName },
        });
      } else {
        const id = await createArea({
          name: name.trim(),
          city,
        });

        await addLog({
          actorUid: profile.uid,
          action: "create_area",
          targetCollection: "areas",
          targetId: id,
          details: { name },
        });
      }
      setName("");
      setCity("");
      setEditingId(null);
      setAreas(await getAllAreas());
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id, label) {
    if (!window.confirm(`Delete '${label}'?`)) return;
    await deleteArea(id);
    setAreas(await getAllAreas());
  }

  return (
    <>
    {/* <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow w-full"> */}
      <h2 className="text-xl font-semibold mb-4">Manage Areas</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <input
            value={editingId ? editingName : name}
            onChange={(e) =>
              editingId
                ? setEditingName(e.target.value)
                : setName(e.target.value)
            }
            className="flex-1 border p-2 rounded w-full 
             focus:outline-none focus:border-blue-500 
             placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base"
            placeholder="Enter name"
          />

          <select
            className="border p-2 rounded"
            value={editingId ? editingCity : city}
            onChange={(e) =>
              editingId
                ? setEditingCity(e.target.value)
                : setCity(e.target.value)
            }
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            className="bg-primary text-white px-4 py-2 rounded w-full sm:w-auto 
             transition-all duration-200 transform hover:scale-105 hover:bg-primary/90"
          >
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditingName("");
              }}
              className="px-4 py-2 border border-gray-400 rounded w-full sm:w-auto 
             transition-all duration-200 transform hover:scale-105 hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : areas.length === 0 ? (
        <p className="mt-4 text-gray-500">No items found.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {areas.map((a) => (
            <li
              key={a.id}
              className="flex flex-col sm:flex-col md:flex-row gap-2 md:justify-between border p-3 rounded"
            >
              <span>
                {a.name} -{" "}
                <span className="text-gray-500 text-sm">{a.city}</span>
              </span>

              <div className="flex gap-3 justify-center md:justify-around">
                <button
                  onClick={() => {
                    setEditingId(a.id);
                    setEditingName(a.name);
                    setEditingCity(a.city);
                  }}
                  className="text-sm text-blue-600 transition-all duration-200 transform hover:scale-110"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  className="text-sm text-red-600 transition-all duration-200 transform hover:scale-110"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    {/* </div> */}
    </>
  );
}

export default AdminAreas;
