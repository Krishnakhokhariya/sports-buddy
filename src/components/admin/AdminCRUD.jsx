import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { addLog } from "../../utils/logs"
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminCRUD({ title, fetchAll, createFn, updateFn, deleteFn }) {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const navigate = useNavigate();
  
  const load = async () => {
    setLoading(true);
    try {
      const all = await fetchAll();
      setItems(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
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
      alert("Operation Failed");
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete '${label}'?`)) return;
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
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
       <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-5 w-5" /> Back
      </button>
      <h2 className="text-xl text-center font-semibold mb-4">{title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          value={editingId ? editingName : name}
          onChange={(e) => (editingId ? setEditingName(e.target.value) : setName(e.target.value))}
          placeholder="Enter name"
          className="flex-1 border p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setEditingName("");
            }}
            className="border px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <span>{item.name}</span>
              <div className="opacity-80 group-hover:opacity-100 flex gap-2 justify-end transition">

                    <button
                      onClick={() => {
                    setEditingId(item.id);
                    setEditingName(item.name);
                  }}
                      className="text-blue-600 hover:scale-125 transition"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="text-red-600 hover:scale-125 transition"
                      title="Delete"
                    >
                     <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

              {/* <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditingName(item.name);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}