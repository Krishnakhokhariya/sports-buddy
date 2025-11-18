

import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

   useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);   
      } else {
        setSidebarOpen(false);  
      }
    }

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      
    
      <AdminSidebar ref={sidebarRef} open={sidebarOpen} />

      
      <div className="flex-1 flex flex-col overflow-hidden">

        
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

       
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 min-h-0">
          {children || <Outlet />}
        </div>

      </div>
    </div>
  );
}
