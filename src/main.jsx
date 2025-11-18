import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import { SidebarProvider } from "./contexts/SidebarContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

// User Pages
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";

// Admin Pages
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSports from "./pages/admin/AdminSports";
import AdminCities from "./pages/admin/AdminCities";
import AdminAreas from "./pages/admin/AdminAreas";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminAddEvent from "./pages/admin/AdminAddEvent";
import AdminEditEvent from "./pages/admin/AdminEditEvent";
import AdminEventDetails from "./pages/admin/AdminEventDetails";

function RootRedirect(){
  const {profile, loading} = useAuth();
  if(loading) return <p className="text-center mt-8">Checking session...</p>;

  if(!profile) return <Navigate to="/login" replace />;

   return profile.role === "admin" ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

// Private route for authenticated users
function PrivateRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) return <p className="text-center mt-8">Checking session...</p>;

  if (!profile) return <Navigate to="/login" replace />;

  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* <SidebarProvider> */}
          <Routes>
            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Routes (wrapped in Layout & PrivateRoute) */}
            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-event" element={<AddEvent />} />
              <Route path="/edit-event/:id" element={<EditEvent />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route
                element={<AdminLayout />} >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/sports" element={<AdminSports />} />
                <Route path="/admin/cities" element={<AdminCities />} />
                <Route path="/admin/areas" element={<AdminAreas />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/events/:id" element={<AdminEventDetails />} />
                <Route path="/admin/events/add" element={<AdminAddEvent />} />
                <Route path="/admin/events/edit/:id" element={<AdminEditEvent />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />

            <Route path="*" element={<p>Page Not Found</p>} />
          </Routes>

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
