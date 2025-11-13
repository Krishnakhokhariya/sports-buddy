import React from "react";
import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen  bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[60px] pb-[60px]">
        <div className="max-w-6xl mx-auto w-full">{children}</div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 text-center py-3 text-gray-600 text-sm border-t shadow-sm">
        © 2025 Sports Buddy
      </footer>
    </div>
  );
}

export default Layout;
