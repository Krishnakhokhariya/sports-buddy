import { React, useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { getAllEvents } from "../utils/events";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sportFilter, setSportFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const navigate = useNavigate();

  function clearFilters() {
    setSportFilter("");
    setCityFilter("");
    setDateFilter("");
  }

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getAllEvents();
        if (!data) {
          console.error("No Data returned from getAllEvents()");
        }
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error("Error fetching events: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events.filter((event) => {
      const sportMatch = event.sport
        ?.toLowerCase()
        .includes(sportFilter.toLowerCase());
      const cityMatch = event.city
        ?.toLowerCase()
        .includes(cityFilter.toLowerCase());
      const eventDate = event.dateTime?.seconds
        ? new Date(event.dateTime.seconds * 1000).toLocaleDateString("en-CA")
        : "";
      const dateMatch = dateFilter ? eventDate === dateFilter : true;
      return sportMatch && cityMatch && dateMatch;
    });
    setFilteredEvents(result);
  }, [sportFilter, cityFilter, dateFilter, events]);

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Loading Events....</p>;
  if (events.length === 0)
    return <p className="text-center text-gray-500 mt-8">No events yet...</p>;

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by sport..."
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value.toLowerCase())}
            className="border p-2 rounded w-full sm:w-1/3"
          />
          <input
            type="text"
            placeholder="city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value.toLowerCase())}
            className="border p-2 rounded w-full sm:w-1/3"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border p-2 rounded w-full sm:w-1/3"
          />
        </div>
        <div className="text-center mb-6">
          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            Clear Filter
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default EventList;
