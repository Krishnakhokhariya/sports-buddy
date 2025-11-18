import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile, loading } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("created");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!profile) return;

      try {
        //fetch events for cratedEvents
        const createdQuery = query(
          collection(db, "events"),
          where("createdBy", "==", profile.uid)
        );
        const createdSnap = await getDocs(createdQuery);
        const created = createdSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        //fetch events for joinedEvents
        const joinedQuery = query(
          collection(db, "events"),
          where("attendees", "array-contains", profile.uid)
        );
        const joinedSnap = await getDocs(joinedQuery);
        const joined = joinedSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setCreatedEvents(created);
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
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary mb-6">
        Welcome, {profile.name}
      </h1>
        <div className="flex w-max rounded-md bg-gray-200 overflow-hidden">
          <button
            onClick={() => setActiveTab("created")}
            className={`px-6 py-2 font-medium transition ${
              activeTab === "created"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } rounded-l-md`}
          >
            Created
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`px-6 py-2 font-medium transition ${
              activeTab === "joined"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } rounded-r-md`}
          >
            Joined
          </button>
        </div>

        <h1 className="text-xl text-primary font-bold mb-0">
          {activeTab === "created" ? "My Created Events" : "My Joined Events"}
        </h1>

        {activeTab === "created" && (
          <div className="mb-4">
            <button
              onClick={() => navigate("/add-event")}
              className="bg-primary text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Add Event
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {activeTab === "created" ? (
            createdEvents.length > 0 ? (
              createdEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full">
                You haven’t created any events yet.
              </p>
            )
          ) : joinedEvents.length > 0 ? (
            joinedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              You haven’t joined any events yet.
            </p>
          )}
        </div>
      </div>
  );
}
