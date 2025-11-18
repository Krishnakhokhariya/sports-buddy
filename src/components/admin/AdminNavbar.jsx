import React from "react";
import { Link } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";


export default function AdminNavbar({ toggleSidebar }) {
  const { profile, logout } = useAuth();

  return (
    <header className="w-full bg-primary shadow flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md lg:hidden text-gray-100 hover:bg-gray-100 hover:text-primary"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <Link to="/admin" className="text-lg text-white font-bold">
          Admin Panel
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Placeholder for admin actions (profile, logout, etc.) */}
        {profile && (
            <button
              onClick={logout}
              className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          )}
      </div>
    </header>
  );
}
