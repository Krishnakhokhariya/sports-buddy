import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../utils/notifications";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const { profile } = useAuth()
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
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border ${
                n.read ? "bg-gray-100" : "bg-yellow-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h3 className="text-lg font-semibold">{n.title}</h3>
                  <p className="text-gray-700 mt-1">{n.message}</p>

                  {n.data?.eventTitle && (
                    <p className="text-sm text-gray-500 mt-2">
                      Event: {n.data.eventTitle}
                    </p>
                  )}
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="mt-3 sm:mt-0 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Mark as Read
                  </button>   
                )}
                <button
                    onClick={() => handleDelete(n.id)}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
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
