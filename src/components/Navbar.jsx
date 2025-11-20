import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { profile, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-md px-4 py-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        {/* Brand */}
        <div className="flex justify-center sm:justify-start mb-2 sm:mb-0">
          <Link to="/dashboard" className="text-2xl font-bold tracking-wide">
            SportsBuddy
          </Link>
        </div>

        {/* Links */}
        {profile && (
          <div className="flex justify-around sm:justify-start gap-4">
            <Link
              to="/add-event"
              className="hover:underline text-white font-medium"
            >
              Add Event
            </Link>
            <Link
              to="/events"
              className="hover:underline text-white font-medium"
            >
              Events
            </Link>
            <Link
              to="/profile"
              className="hover:underline text-white font-medium"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
