import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import usePopup from "../hooks/usePopup";
import {
  leaveEvent,
  deleteEvent,
  joinEvent,
  getEventAttendeeRequests,
} from "../utils/events";

import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showPopup, showConfirm, popupElement } = usePopup();

  const [event, setEvent] = useState(null);
  const [creator, setCreator] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const ref = doc(db, "events", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) return setEvent(null);

        const data = { id: snap.id, ...snap.data() };
        setEvent(data);

        if (data.createdBy) {
          const creatorRef = doc(db, "users", data.createdBy);
          const crSnap = await getDoc(creatorRef);
          if (crSnap.exists()) setCreator(crSnap.data());
        }
      } catch (e) {
        console.error("Error loading event:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  async function refreshAttendees() {
    if (!event?.id) return;

    try {
      const attendeesRef = collection(db, `events/${event.id}/attendees`);
      const attendeesSnap = await getDocs(attendeesRef);

      const acceptedOnly = [];

      attendeesSnap.forEach((d) => {
        const data = d.data();
        if (!data.status || data.status === "accepted") {
          acceptedOnly.push({ id: d.id, ...data });
        }
      });

      setAttendees(acceptedOnly);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    }
  }

  useEffect(() => {
    refreshAttendees();

    async function loadPending() {
      if (!event?.id || event.createdBy !== profile?.uid) return;

      const pending = await getEventAttendeeRequests(event.id, "pending");
      setPendingCount(pending.length);
    }

    loadPending();
  }, [event?.id, event?.createdBy, profile?.uid]);

  const isUserJoined = event?.attendees?.includes(profile?.uid);

  async function handleJoin() {
    if (!profile) return await showPopup("Please log in first.");
    // alert("Please log in first.");
    setJoining(true);

    try {
      await joinEvent(event.id, profile, event.title);

      setEvent((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), profile.uid],
      }));

      await refreshAttendees();
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    const confirmed = await showConfirm("Leave this event?");
    if (!confirmed) return;
    setJoining(true);
    try {
      await leaveEvent(event.id, profile, event.title);

      setEvent((prev) => ({
        ...prev,
        attendees: prev.attendees.filter((uid) => uid !== profile.uid),
      }));

      await refreshAttendees();
    } finally {
      setJoining(false);
    }
  }

  async function handleDelete() {
    // if (!window.confirm("Are you sure you want to delete this event?")) return;
    const confirmed = await showConfirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      await deleteEvent(event.id, profile, event.title);
      await showPopup("Event Deleted successfully.");
      // alert("Event deleted successfully.");
      navigate("/dashboard");
    } catch (err) {
      await showPopup("");
      await showPopup("Failed to delete event.");
      // console.error("Error deleting:", err);
    }
  }

  if (loading) return <p className="p-6 text-center">Loading event...</p>;
  if (!event) return <p className="p-6 text-center">Event not found.</p>;

  const Row = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-2 border-b last:border-b-0">
      <div className="w-full sm:w-40 text-sm text-gray-600 font-medium">
        {label}
      </div>
      <div className="text-gray-800">{value}</div>
    </div>
  );

  return (
    <>
      <div className="max-w-3xl mx-auto p-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-blue-600 hover:underline"
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back
        </button>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">Event</div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {event.title}
              </h1>
              <p className="text-sm text-gray-500">{event.sport}</p>
            </div>

            {(profile?.role === "admin" ||
              event.createdBy === profile?.uid) && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-event/${event.id}`)}
                  title="Edit"
                  className="p-2 text-blue-600 hover:scale-125 transition"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={handleDelete}
                  title="Delete"
                  className="p-2 text-red-600 hover:scale-125 transition"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded">
            <Row label="Sport" value={event.sport} />
            <Row
              label="Date & Time"
              value={
                event.dateTime
                  ? new Date(event.dateTime.seconds * 1000).toLocaleString()
                  : "-"
              }
            />
            <Row label="City" value={event.city} />
            <Row label="Area" value={event.area} />
            <Row label="Skill Level" value={event.skill} />
          </div>

          <div className="mt-4 p-4 border rounded bg-white">
            <div className="text-sm text-gray-600 font-medium mb-1">
              Created By
            </div>
            <div className="text-gray-800">
              {creator?.name || "Unknown User"}
              <br />
              <span className="text-gray-500 text-sm">
                {creator?.email || "No email available"}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 border rounded bg-white">
            <div className="text-sm text-gray-600 font-medium mb-1">
              Description
            </div>
            <div>{event.description || "No description."}</div>
          </div>

          <div className="mt-4 p-4 border rounded bg-white">
            <div className="flex justify-between">
              <h3 className="text-sm text-gray-600 font-medium">Attendees</h3>
              {event.createdBy === profile?.uid && pendingCount > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  {pendingCount} pending
                </span>
              )}
            </div>

            {attendees.length > 0 ? (
              <ul className="list-disc ml-6 mt-2 space-y-1">
                {attendees.map((a) => (
                  <li key={a.id} className="break-words break-all">
                    {a.displayName || a.name || "Anonymous"} <br />({a.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-2">No accepted attendees yet.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {isUserJoined ? (
              <button
                onClick={handleLeave}
                disabled={joining}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                {joining ? "Leaving..." : "Leave Event"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {joining ? "Joining..." : "Join Request"}
              </button>
            )}

            {event.createdBy === profile?.uid && (
              <button
                onClick={() =>
                  navigate(`/events/${event.id}/attendee-requests`)
                }
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                View Requests
                {pendingCount > 0 && (
                  <span className="ml-2 bg-yellow-500 px-2 py-1 rounded text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {popupElement}
    </>
  );
}

export default EventDetail;
