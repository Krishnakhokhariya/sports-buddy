import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { authUser, profile, loading } = useAuth();

  if (loading) return <p className="text-center mt-8">Checking access...</p>;

  if (!authUser) return <Navigate to="/login" replace />;

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>;

  if (profile.role !== "admin") return <Navigate to="/" replace />;

  return children;
}