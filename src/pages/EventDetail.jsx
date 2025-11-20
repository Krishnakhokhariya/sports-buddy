import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { leaveEvent } from "../utils/events";
import { deleteEvent } from "../utils/events";
import { joinEvent } from "../utils/events";
import { getEventAttendeeRequests } from "../utils/events";

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [creator, setCreator] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [pendingCount, setPendingCount] = useState(0); // Count of pending requests

  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fectEvent() {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const eventData = { id: docSnap.id, ...docSnap.data() };
          setEvent(eventData);

          if (eventData.createdBy) {
            const creatorRef = doc(db, "users", eventData.createdBy);
            const creatorSnap = await getDoc(creatorRef);
            if (creatorSnap.exists()) {
              setCreator(creatorSnap.data());
            }
          }
        } else {
          console.error("No such Event!");
        }
      } catch (err) {
        console.error("Error Fetching event: ", err);
      } finally {
        setLoading(false);
      }
    }
    fectEvent();
  }, [id]);

  const refreshAttendees = async () => {
    if (!event?.id) return;
    try {
      // Fetch all attendees first
      const attendeesRef = collection(db, `events/${event.id}/attendees`);
      const attendeesSnap = await getDocs(attendeesRef);
      const allAttendees = [];
      
      attendeesSnap.forEach((doc) => {
        const data = doc.data();
        // Show accepted attendees OR old attendees without status (backward compatibility)
        // Hide pending requests from regular view
        if (!data.status || data.status === "accepted") {
          allAttendees.push({
            id: doc.id,
            ...data,
          });
        }
      });
      
      setAttendees(allAttendees);
    } catch (err) {
      console.error("Error Fetching attendees: ", err);
    }
  };

  useEffect(() => {
    refreshAttendees();
    
    // Load pending count if user is creator
    async function loadPendingCount() {
      if (!event?.id || event.createdBy !== profile?.uid) return;
      try {
        const pendingRequests = await getEventAttendeeRequests(event.id, "pending");
        setPendingCount(pendingRequests.length);
      } catch (err) {
        console.error("Error loading pending count:", err);
      }
    }
    
    loadPendingCount();
  }, [event?.id, event?.createdBy, profile?.uid]);

  const isUserJoined = event?.attendees?.includes(profile?.uid);

  async function handleJoin() {
    if (!profile) return alert("Please login to join this event!");
    setJoining(true);
    try {
      await joinEvent(event.id, profile, event.title);
      
      setEvent((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), profile.uid],
      }));
      
      await refreshAttendees();
    } catch (err) {
      console.error("Error Joining event: ", err);
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    setJoining(true);
    try {
      await leaveEvent(event.id, profile, event.title);
      setEvent((prev) => ({
        ...prev,
        attendees: prev.attendees.filter((uid) => uid !== profile.uid),
      }));
      await refreshAttendees();
    } catch (err) {
      console.error("Error leaving event: ", err);
    } finally {
      setJoining(false);
    }
  }

  async function handleDelete() {
    if (window.confirm(`Are you sure to delete this event?`)) {
      try {
        await deleteEvent(event.id, profile, event.title);
        alert("Event deleted successfully!");
        navigate("/dashboard");
      } catch (err) {
        console.error("Error deleting event: ", err);
      }
    }
  }

  if (loading) return <p className="text-center mt-8">Loading Event...</p>;
  if (!event) return <p className="text-center mt-8">Event not Found...</p>;

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl">
          <h1 className="text-2xl font-bold text-primary mb-3">
            {event.title}
          </h1>
          <p>
            <strong>Sport:</strong> {event.sport}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {event.dateTime
              ? new Date(event.dateTime.seconds * 1000).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>City:</strong> {event.city}
          </p>
          <p>
            <strong>Area:</strong> {event.area}
          </p>
          <p>
            <strong>Skill:</strong> {event.skill}
          </p>
          <p className="mt-2">
            <strong>Description:</strong> {event.description}
          </p>

          <div className="mt-4">
            <p className="font-semibold">
              Posted By: {""}
              <span className="text-gray-700">
                {creator ? creator.name : "Unknown User"}
              </span>
            </p>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Attendees: </h3>
              {/* Show pending count badge for creator */}
              {event.createdBy === profile?.uid && pendingCount > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  {pendingCount} pending request{pendingCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {attendees.length > 0 ? (
              <ul className="list-disc ml-6 text-gray-700">
                {attendees.map((a, index) => {
                  return <li key={index}>{a.displayName || a.name || "Anonymous"}</li>;
                })}
              </ul>
            ) : (
              <p className="text-gray-500">No accepted attendees yet...</p>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {isUserJoined ? (
              <button
                onClick={handleLeave}
                disabled={joining}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {joining ? "Leaving..." : "Leave Event"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Event"}
              </button>
            )}

            {(profile?.role === "admin" ||
              event.createdBy === profile?.uid) && (
              <div className="flex flex-col gap-3">
                {/* View Attendee Requests Button - Only for creator */}
                {event.createdBy === profile?.uid && (
                  <button
                    onClick={() => navigate(`/events/${event.id}/attendee-requests`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    View Attendee Requests
                    {pendingCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500 rounded">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetail;
