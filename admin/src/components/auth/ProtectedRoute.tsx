import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();
  if (isLoading) return null; // wait for localStorage to be checked
  if (!token) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
