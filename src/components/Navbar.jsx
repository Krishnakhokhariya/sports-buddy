import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className= 'bg-blue-600 text-white px-4 py-3 shadow-md flex flex-wrap items-center justify-between gap-2'>
      <Link to="/" className="text-2xl font-bold tracking-wide">
        SportsBuddy
      </Link>

      <div className="flex flex-wrap gap-4 items-center text-sm font-medium">
        <Link to="/events" className="hover:underline">
          Events
        </Link>

        {currentUser ? (
          <>
            <Link to="/add-event" className="hover:underline">
              Add Event
            </Link>
            {/* <Link to="/" className="hover:underline">
              Dashboard
            </Link> */}
            <button onClick={logout} className='bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-100'>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
