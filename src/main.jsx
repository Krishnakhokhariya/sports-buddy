import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
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

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/add-event" element={<PrivateRoute><AddEvent /></PrivateRoute>}></Route>
           <Route path="/edit-event/:id" element={<PrivateRoute><EditEvent /></PrivateRoute>}></Route>
          <Route path='/events' element={<EventList />}></Route>
          <Route path='/events/:id' element={<EventDetail />}></Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
