import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSidebar } from "../contexts/SidebarContext";

function Navbar() {
  const { profile, logout } = useAuth();
  const { setSidebarOpen } = useSidebar();

  const isAdmin = profile?.role === "admin";
  const homelink = isAdmin ? "/admin" : "/";

  return (
    <nav className="bg-blue-600 text-white shadow-md px-4 py-2">
      {/* Large & Medium screens */}
      <div className="hidden md:flex items-center justify-between">
        {/* Left: Button for admin only */}
        {isAdmin && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-white text-blue-600 rounded-md shadow mr-4"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}

        {/* Brand name */}
        <Link
          to={homelink}
          className={`text-2xl font-bold tracking-wide ${
            isAdmin ? "mr-auto" : ""
          }`}
        >
          SportsBuddy
        </Link>

        {/* Nav links */}
        <div className="flex gap-6 items-center text-sm font-medium">
          <Link to="/events" className="hover:underline">
            Events
          </Link>
          <Link to="/add-event" className="hover:underline">
            Add Event
          </Link>
          {profile && (
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Small screens */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center justify-between">
          {/* Button only if admin */}
          {isAdmin ? (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-white text-blue-600 rounded-md shadow"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          ) : (
            <div className="w-10" /> // empty space to balance
          )}

          {/* Centered brand */}
          <Link to={homelink} className="text-2xl font-bold tracking-wide">
            SportsBuddy
          </Link>

          {/* Empty space to balance button on left */}
          <div className="w-10" />
        </div>

        {/* Nav links spaced around below */}
        <div className="flex justify-around mt-3 text-sm font-medium">
          <Link to="/events" className="hover:underline">
            Events
          </Link>
          <Link to="/add-event" className="hover:underline">
            Add Event
          </Link>
          {profile && (
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
