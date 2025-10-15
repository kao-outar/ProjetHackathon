import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Vous devez être connecté</p>;

  return (
    <div>
      <h2>Profil de {user.name}</h2>
      <p>Email : {user.email}</p>
      <p>Âge : {user.age}</p>
      <p>Genre : {user.gender}</p>
    </div>
  );
}