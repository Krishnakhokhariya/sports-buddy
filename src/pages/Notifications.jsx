import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../utils/notifications";
import { useNavigate } from "react-router-dom";

import {
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function Notifications() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    async function load() {
      const items = await getUserNotifications(profile.uid);
      setNotifications(items);
      setLoading(false);
    }

    load();
  }, [profile]);

  async function handleMarkRead(id) {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleDelete(id) {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto w-full bg-white rounded-xl shadow-md p-4 sm:p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          No notifications yet.
        </p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border flex justify-between items-start gap-4 ${
                n.read ? "bg-gray-100" : "bg-yellow-50"
              }`}
            >
              {/* LEFT TEXT SECTION */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {n.title}
                </h3>

                <p className="text-gray-700 mt-1 break-words">
                  {n.message}
                </p>

                {n.data?.eventTitle && (
                  <p className="text-sm text-gray-500 mt-2">
                    Event: {n.data.eventTitle}
                  </p>
                )}
              </div>

             
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">

               
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as Read"
                    className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-700" />
                  </button>
                )}

                
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition"
                >
                  <TrashIcon className="h-6 w-6 text-red-700" />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
