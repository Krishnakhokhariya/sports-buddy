import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20">
        <Outlet />
      </main>

      <footer className="bg-gray-100 text-center py-3 text-gray-600 text-sm border-t shadow-sm mt-auto">
        © 2025 Sports Buddy
      </footer>
    </div>
  );
}

export default Layout;
