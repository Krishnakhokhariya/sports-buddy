import React from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`}>
      <div className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition duration-300">
        <h2 className="text-xl font-semibold text-primary mb-2">
          {event.title}
        </h2>
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
            ? new Date(event.dateTime.seconds * 1000).toLocaleString("en-IN")
            : "N/A"}
        </p>
        <p className="text-gray-700">
          <strong>Skill Level: </strong>
          {event.skill}
        </p>
      </div>
    </Link>
  );
}

export default EventCard;
