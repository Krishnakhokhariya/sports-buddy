import React, { useEffect, useState } from "react";
import { addLog } from "../../utils/logs";
import { useAuth } from "../../contexts/AuthContext";

function AdminCRUD({ title, fetchAll, createFn, updateFn, deleteFn }) {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  async function load() {
    setLoading(true);

    try {
      const all = await fetchAll();
      setItems(all);
    } catch (err) {
      console.error("Failed to load", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = editingId ? editingName : name;
    if (!value.trim()) return;

    try {
      if (editingId) {
        await updateFn(editingId, { name: value.trim() });
        await addLog({
          actorUid: profile.uid,
          action: `update_${title}`,
          targetCollection: title,
          targetId: editingId,
          details: { name: value },
        });
      } else {
        const id = await createFn({ name: value.trim() });
        await addLog({
          actorUid: profile.uid,
          action: `create_${title}`,
          targetCollection: title,
          targetId: id,
          details: { name: value },
        });
      }
      setName("");
      setEditingId(null);
      setEditingName("");
      load();
    } catch (err) {
      alert("OPeration Failed");
    }
  }

  async function handleDelete(id, label) {
    if (!window.confirm(`Delete '${label}'? `)) return;
    try {
      await deleteFn(id);
      await addLog({
        actorUid: profile.uid,
        action: `delete_${title}`,
        targetCollection: title,
        targetId: id,
        details: { name: label },
      });
      load();
    } catch (err) {
      console.error("Failed to delete sports", err);
      alert("Failed to delete");
    }
  }
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

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

          <button className="bg-primary text-white px-4 py-2 rounded w-full sm:w-auto 
             transition-all duration-200 transform hover:scale-105 hover:bg-primary/90">
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
      ) : items.length === 0 ? (
        <p className="mt-4 text-gray-500">No items found.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between border p-3 rounded"
            >
              <span>{item.name}</span>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditingName(item.name);
                  }}
                  className="text-sm text-blue-600 transition-all duration-200 transform hover:scale-110"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="text-sm text-red-600 transition-all duration-200 transform hover:scale-110"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default AdminCRUD;
