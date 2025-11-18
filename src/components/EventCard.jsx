import React from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold text-primary mb-2">{event.title}</h2>
      <p className="text-gray-700">
        <strong>Sport: </strong>
        {event.sport}
      </p>
      <p className="text-gray-700">
        <strong>City: </strong>
        {event.city}, {event.area}
      </p>
      <p className="text-gray-700">
        <strong>Date: </strong>
        {event.dateTime
          ? new Date(event.dateTime.seconds * 1000).toLocaleString()
          : "N/A"}
      </p>
      <p className="text-gray-700">
        <strong>Skill Level: </strong>
        {event.skill}
      </p>

      <Link
        to={`/events/${event.id}`}
        className="block mt-3 bg-primary text-white text-center p-2 rounded hover:bg-blue-600 transition"
      >
        View Details
      </Link>
    </div>
  );
}

export default EventCard;
