import { useEffect, useState } from "react";
import API from "../api/axiosClient";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await API.get("/users");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("❌ Erreur API :", err);
        setError("Impossible de récupérer les utilisateurs");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Liste des utilisateurs</h2>
      <ul>
        {users.length > 0 ? (
          users.map(u => (
            <li key={u.uuid}>
              {u.name || "(Sans nom)"} — {u.email}
            </li>
          ))
        ) : (
          <p>Aucun utilisateur trouvé.</p>
        )}
      </ul>
    </div>
  );
}