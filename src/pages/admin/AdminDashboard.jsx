import React, { useState } from "react";
import AdminSports from "./AdminSports";
import AdminCities from "./AdminCities";
import AdminAreas from "./AdminAreas";
import AdminEvents from "./AdminEvents";
import AdminLogs from "./AdminLogs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("sports");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md h-screen sticky top-0 p-5">
        <h2 className="text-xl font-bold mb-6 text-primary">Admin Panel</h2>

        <ul className="space-y-3">
          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeTab === "sports"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("sports")}
            >
              Manage Sports
            </button>
          </li>

          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeTab === "cities"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("cities")}
            >
              Manage Cities
            </button>
          </li>

          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeTab === "areas"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("areas")}
            >
              Manage Areas
            </button>
          </li>

          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeTab === "events"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("events")}
            >
              Manage Events
            </button>
          </li>

          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                activeTab === "logs"
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("logs")}
            >
              View Logs
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6">
        {activeTab === "sports" && <AdminSports />}
        {activeTab === "cities" && <AdminCities />}
        {activeTab === "areas" && <AdminAreas />}
        {activeTab === "events" && <AdminEvents />}
        {activeTab === "logs" && <AdminLogs />}
      </main>
    </div>
  );
}
