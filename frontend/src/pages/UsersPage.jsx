import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get("https://hackathon-dorphs-projects.vercel.app/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer les utilisateurs");
      }
    }

    fetchUsers();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Liste des utilisateurs</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
        <ul>
            {Array.isArray(users) && users.map(u => (
                <li key={u.uuid}>{u.name} ({u.email})</li>
            ))}
        </ul>
    </div>
  );
}
