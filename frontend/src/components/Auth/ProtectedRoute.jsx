import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../Sidebar/Sidebar";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1 }}>{children}</main>
    </div>
  );
}