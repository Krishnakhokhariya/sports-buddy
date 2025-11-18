import React, { forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const tabs = [
  { id: "dashboard", label: "Dashboard", path: "/admin" },
  { id: "events", label: "Manage Events", path: "/admin/events" },
  { id: "sports", label: "Manage Sports", path: "/admin/sports" },
  { id: "cities", label: "Manage Cities", path: "/admin/cities" },
  { id: "areas", label: "Manage Areas", path: "/admin/areas" },
  { id: "logs", label: "View Logs", path: "/admin/logs" },
];

const AdminSidebar = forwardRef(({ open }, ref) => {
  const location = useLocation();
  const { profile } = useAuth();

  return (
    <aside
      ref={ref}
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-300 z-50 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static `}
    >
      <h2 className="text-xl text-primary font-bold p-5 border-b">{profile.name}</h2>
      <nav className="flex flex-col mt-4 p-2 gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`px-3 py-2 rounded font-medium ${
              location.pathname === tab.path ? "bg-blue-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
});

export default AdminSidebar;