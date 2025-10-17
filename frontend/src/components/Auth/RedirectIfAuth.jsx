// components/auth/RedirectIfAuth.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;
  if (user) return <Navigate to="/feed" replace />; // Si déjà co, redirige

  return children;
}