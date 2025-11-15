import React from "react";
import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className=" flex flex-col h-screen  bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </header>

      <main className="flex-1 pt-[70px] pb-[70px] flex justify-center">
        <div className="max-w-6xl w-full mb-20">
          <div className="overflow-y-auto bg-white border border-gray-300 shadow-[6px_6px_12px_rgba(0,0,0,0.15)] max-h-[calc(100vh-160px)] ">
            <div className="px-6 py-4 scrollbar-hide">
              {children}
            </div>

          </div>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 text-center py-3 text-gray-600 text-sm border-t shadow-sm">
        © 2025 Sports Buddy
      </footer>
    </div>
  );
}

export default Layout;
