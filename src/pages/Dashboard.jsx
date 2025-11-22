import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("created");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;

      try {
       
        const createdQuery = query(
          collection(db, "events"),
          where("createdBy", "==", profile.uid)
        );
        const createdSnap = await getDocs(createdQuery);
        const created = createdSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const allEventsSnap = await getDocs(collection(db, "events"));
        const allEvents = allEventsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const pending = [];
        const joined = [];
        for (const event of allEvents) {
          const attendeeRef = doc(
            db,
            `events/${event.id}/attendees`,
            profile.uid
          );
          const attendeeSnap = await getDoc(attendeeRef);

          if (attendeeSnap.exists()) {
            const status = attendeeSnap.data().status;

            if (status === "pending") {
              pending.push(event);
            }

            if (status === "accepted") {
              joined.push(event);
            }
          }
        }

        setCreatedEvents(created);
        setPendingEvents(pending);
        setJoinedEvents(joined);
      } catch (err) {
        console.error("Error fetching dashboard data: ", err);
      } finally {
        setPageLoading(false);
      }
    }

    fetchData();
  }, [profile]);

  if (loading || pageLoading)
    return (
      <p className="text-center text-gray-500 mt-8">Loading Dashboard...</p>
    );

  return (
  <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 relative">

    <h1 className="text-2xl font-bold text-primary mb-4 text-center sm:text-left">
      Welcome, {profile.name}
    </h1>

    {/* Responsive Tabs */}
    <div className="flex flex-wrap justify-center gap-2 w-full">
      <button
        onClick={() => setActiveTab("created")}
        className={`px-6 py-2 font-medium rounded-md transition ${
          activeTab === "created"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Created
      </button>

      <button
        onClick={() => setActiveTab("pending")}
        className={`px-6 py-2 font-medium rounded-md transition ${
          activeTab === "pending"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Pending
      </button>

      <button
        onClick={() => setActiveTab("joined")}
        className={`px-6 py-2 font-medium rounded-md transition ${
          activeTab === "joined"
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Joined
      </button>
    </div>

   
    <h1 className="text-xl text-primary font-bold text-center">
      {activeTab === "created"
        ? "My Created Events"
        : activeTab === "pending"
        ? "Pending Requests"
        : "My Joined Events"}
    </h1>

   
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {activeTab === "created" &&
        (createdEvents.length > 0 ? (
          createdEvents.map((e) => <EventCard key={e.id} event={e} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No created events.
          </p>
        ))}

      {activeTab === "pending" &&
        (pendingEvents.length > 0 ? (
          pendingEvents.map((e) => <EventCard key={e.id} event={e} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No pending requests.
          </p>
        ))}

      {activeTab === "joined" &&
        (joinedEvents.length > 0 ? (
          joinedEvents.map((e) => <EventCard key={e.id} event={e} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No joined events.
          </p>
        ))}
    </div>

    {/* Floating Add Event Button (only for created tab) */}
    {activeTab === "created" && (
      <button
        onClick={() => navigate("/add-event")}
        className="fixed bottom-12 right-6 w-14 h-14 rounded-full 
                   bg-blue-600 text-white text-4xl leading-none 
                   flex items-center justify-center 
                   shadow-xl hover:bg-blue-700 transition-all"
        title="Add Event"
      >
        +
      </button>
    )}
  </div>
);

}
