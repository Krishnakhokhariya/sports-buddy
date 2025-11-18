import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { addLog } from "../../utils/logs";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

function AdminEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [creator, setCreator] = useState(null);
  const [attendeeProfiles, setAttendeeProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) {
          setEvent(null);
          return;
        }
        const evData = { id: eventSnap.id, ...eventSnap.data() };
        setEvent(evData);

        if (evData.createdBy) {
          const crRef = doc(db, "users", evData.createdBy);
          const crSnap = await getDoc(crRef);
          if (crSnap.exists()) setCreator({ uid: crSnap.id, ...crSnap.data() });
        }

        const attendeesRef = collection(db, "events", id, "attendees");
        const attendeeDocs = await getDocs(attendeesRef);

        const profiles = [];

        for (const docSnap of attendeeDocs.docs) {
          const attendeeUid = docSnap.id;

          try {
            const uRef = doc(db, "users", attendeeUid);
            const uSnap = await getDoc(uRef);
            if (uSnap.exists()) {
              profiles.push({ uid: attendeeUid, ...uSnap.data() });
            }
          } catch (e) {}
        }

        setAttendeeProfiles(profiles);
      } catch (err) {
        console.error("Error loading event (admin):", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    )
      setDeleting(true);
    try {
      await deleteDoc(doc(db, "events", id));
      try {
        await addLog({
          actorUid: profile?.uid || null,
          action: "delete_event_byAdmin",
          targetCollection: "events",
          targetId: id,
          details: {
            title: event?.title || null,
          },
        });
      } catch (err) {
        console.warn("Error logging admin event deletion:", err);
      }
      alert("Event deleted successfully.");
      navigate("/admin/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="p-6 text-center text-gray-600">Event not found.</div>
    );
  }

  const Row = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b last:border-b-0">
      <div className="w-full sm:w-40 text-sm text-gray-600 font-medium">
        {label}
      </div>
      <div className="flex-1 text-gray-800">{value}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Event</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {event.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{event.sport}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:underline mr-2"
          >
            ← Back
          </button>

          <button
            onClick={() => navigate(`/admin/events/edit/${id}`)}
            title="Edit event"
            className="p-2 rounded text-blue-600 hover:scale-125 transition"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete event"
            className="p-2 rounded  text-red-600 hover:scale-125 transition"
          >
            <TrashIcon className="h-5 w-5" />
          </button>

        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="bg-gray-50 rounded p-4">
          <Row label="Sport" value={event.sport || "-"} />
          <Row
            label="Date & Time"
            value={
              event.dateTime
                ? new Date(event.dateTime.seconds * 1000).toLocaleString()
                : "-"
            }
          />
          <Row label="City" value={event.city || "-"} />
          <Row label="Area" value={event.area || "-"} />
          <Row label="Skill Level" value={event.skill || "-"} />
        </div>

        <div className="bg-white rounded p-4 border">
          <div className="text-sm text-gray-600 font-medium mb-2">
            Description
          </div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {event.description || "No Description"}
          </div>
        </div>

        <div className="bg-white rounded p-4 border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Attendees</div>
            <div className="text-xs text-gray-500">
              {attendeeProfiles.length} joined
            </div>
          </div>
          {attendeeProfiles.length === 0 ? (
            <div className="text-gray-500"> No attendees yet.</div>
          ) : (
            <ul className="list-disc ml-5 space-y-2">
              {attendeeProfiles.map((attendee) => (
                <li key={attendee.uid} className="text-gray-800">
                  <div className="font-semibold">
                    {attendee.displayName || attendee.name || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {attendee.city
                      ? `${attendee.city} • ${attendee.email || ""}`
                      : attendee.email || ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded p-4 border">
          <div className="text-sm text-gray-600 font-medium mb-2">Meta</div>
          <div className="text-gray-700 text-sm">
            <div>
              Event ID:{" "}
              <span className="text-xs text-gray-500 ml-2">{event.id}</span>
            </div>
            <div className="mt-1">
              Created by:{" "}
              <span className="font-medium ml-2">
                {creator ? creator.name : "Unknown"}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Created at:{" "}
              {event.createdAt
                ? new Date(event.createdAt.seconds * 1000).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEventDetails;
