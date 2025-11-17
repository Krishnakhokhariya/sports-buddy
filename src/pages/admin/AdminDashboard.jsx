import React, { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

import AdminSports from "./AdminSports";
import AdminCities from "./AdminCities";
import AdminAreas from "./AdminAreas";
import AdminEvents from "./AdminEvents";
import AdminLogs from "./AdminLogs";
import Layout from "../../components/Layout";
import { useSidebar } from "../../contexts/SidebarContext";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("sports");
  const {sidebarOpen, setSidebarOpen} = useSidebar();

  // Close sidebar when clicking outside
  function handleOverlayClick(e) {
    if (e.target.id === "overlay") setSidebarOpen(false);
  }

  return (
    <Layout>
    <div className="flex h-screen relative">

      {/* <button
        className="fixed top-6 left-4 z-50 p-2 bg-primary text-white rounded-md shadow"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button> */}

      {sidebarOpen && (
        <div
          id="overlay"
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        ></div>
      )}

      <aside
        className={`
          fixed 
          top-0 left-0 h-full w-64 bg-white shadow-md p-5 z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full "}
        `}
      >
        
        <button
          className="absolute top-4 right-4 text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-primary">Admin Panel</h2>

        <ul className="space-y-3">
          {[
            { id: "sports", label: "Manage Sports" },
            { id: "cities", label: "Manage Cities" },
            { id: "areas", label: "Manage Areas" },
            { id: "events", label: "Manage Events" },
            { id: "logs", label: "View Logs" }
          ].map((tab) => (
            <li key={tab.id}>
              <button
                className={`w-full text-left p-2 rounded ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false); // auto-close on mobile
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-0 mt-0 flex flex-col">
        {activeTab === "sports" && <AdminSports />}
        {activeTab === "cities" && <AdminCities />}
        {activeTab === "areas" && <AdminAreas />}
        {activeTab === "events" && <AdminEvents />}
        {activeTab === "logs" && <AdminLogs />}
      </main>
    </div>
    </Layout>
  );
}
