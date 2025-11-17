import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { addLog } from "../../utils/logs";
import EventForm from "../../components/forms/EventForm";
import { useAuth } from "../../contexts/AuthContext";

function AdminEvents() {
  const { profile } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadEvents() {
    setLoading(true);
    const snap = await getDocs(collection(db, "events"));
    setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleDelete(id, title = "") {
    if (!window.confirm(`Delete event "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, "events", id));

      await addLog({
        actorUid: profile.uid,
        action: "delete_event",
        targetCollection: "events",
        targetId: id,
        details: { title },
      });

      loadEvents();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete event");
    }
  }
  function startEdit(ev) {
    setEditingEvent(ev);
    setShowForm(true);
  }
  function handleUpdateSuccess() {
    setShowForm(false);
    setEditingEvent(null);
    loadEvents();
  }

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow w-full">
      <h2 className="text-xl font-semibold mb-4">Manage Events</h2>
      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex justify-center items-start overflow-y-auto py-10 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-xl w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold">Edit Event</h3>
              <button
                className="text-red-500 font-bold text-xl"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
              >
                ✕
              </button>
            </div>

            <EventForm
              existingEvent={editingEvent}
              onSubmitSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="border rounded p-4 flex flex-col sm:flex-row justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-lg">{ev.title}</div>
                <div className="text-sm text-gray-600">
                  {ev.sport} — {ev.city} — {ev.area}
                </div>
                <div className="text-xs text-gray-500">
                  {ev.dateTime
                    ? new Date(ev.dateTime.seconds * 1000).toLocaleString()
                    : ""}
                </div>
              </div>

              <div className="flex gap-3 justify-around sm:items-center">
                <button
                  onClick={() => startEdit(ev)}
                  className="text-blue-600 hover:scale-110 transition text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(ev.id, ev.title)}
                  className="text-red-600 hover:scale-110 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminEvents;
