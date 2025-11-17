import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { SidebarProvider } from "./contexts/SidebarContext";

function PrivateRoute({ children }) {
  const { authUser, loading } = useAuth();

  if (loading) return <p className="text-center mt-8">Checking session...</p>;

  if (!authUser) return <Navigate to="/login" replace />;

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/add-event"
              element={
                <PrivateRoute>
                  <AddEvent />
                </PrivateRoute>
              }
            ></Route>
            <Route
              path="/edit-event/:id"
              element={
                <PrivateRoute>
                  <EditEvent />
                </PrivateRoute>
              }
            ></Route>
            <Route path="/events" element={<EventList />}></Route>
            <Route path="/events/:id" element={<EventDetail />}></Route>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            ></Route>
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
