import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";


import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

function Navbar() {
  const { profile, logout } = useAuth();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadEvents, setUnreadEvents] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  
  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", profile.uid),
      where("read", "==", false)
    );
    return onSnapshot(q, (snap) => setUnreadNotifications(snap.size));
  }, [profile?.uid]);

  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", profile.uid),
      where("type", "==", "new_event"),
      where("read", "==", false)
    );
    return onSnapshot(q, (snap) => setUnreadEvents(snap.size));
  }, [profile?.uid]);

  
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <nav className="bg-blue-600 text-white shadow-md px-4 py-2 relative">
      <div className="flex justify-between items-center">

        
        <Link to="/dashboard" className="text-2xl font-bold tracking-wide hover:scale-105 transition">
          SportsBuddy
        </Link>

       
        {profile && (
          <div className="flex items-center gap-4">

            
            <Link to="/notifications" className="relative">
              <BellIcon className="h-7 w-7 hover:scale-105 transition" />

              {unreadNotifications > 0 && (
                <span className="absolute -top-2 right-0 translate-x-3 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </Link>

           
            <button
              ref={buttonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-md transition
                       bg-transparent hover:bg-white hover:text-blue-600"
            >
              {menuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>

            
            <div className="hidden sm:flex gap-5 items-center">

              <Link to="/add-event" className="hover:font-semibold font-medium">
                Add Event
              </Link>

              <Link to="/events" className="hover:font-semibold font-medium relative">
                Events
                {unreadEvents > 0 && (
                  <span className="absolute -top-2 right-0 translate-x-3 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                    {unreadEvents}
                  </span>
                )}
              </Link>

              <Link to="/profile" className="hover:font-semibold font-medium">
                Profile
              </Link>

              <button
                onClick={logout}
                className="bg-white text-blue-600 px-3 py-1 rounded-md font-semibold hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

     
      {menuOpen && profile && (
        <div
          ref={menuRef}
          className="sm:hidden absolute right-2 mt-3 w-48 bg-blue-600 
                     rounded-lg p-3 shadow-lg space-y-3 z-40"
        >
          <Link
            to="/add-event"
            onClick={() => setMenuOpen(false)}
            className="block text-white font-medium px-3 py-2 rounded-md hover:bg-blue-500"
          >
            Add Event
          </Link>

          <Link
            to="/events"
            onClick={() => setMenuOpen(false)}
            className="block text-white font-medium relative px-3 py-2 rounded-md hover:bg-blue-500"
          >
            Events
            {unreadEvents > 0 && (
              <span className="absolute top-2 right-0 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                {unreadEvents}
              </span>
            )}
          </Link>

          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block text-white font-medium px-3 py-2 rounded-md hover:bg-blue-500"
          >
            Profile
          </Link>

          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full bg-white text-blue-600 px-3 py-2 rounded-md font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
