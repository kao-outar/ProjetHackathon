import { useEffect, useState } from "react";
import API from "../api/axiosClient";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Liste des utilisateurs</h2>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 15px",
          marginBottom: 20,
          fontSize: 16,
          border: "2px solid #ddd",
          borderRadius: 8,
          outline: "none",
          transition: "border-color 0.3s"
        }}
        onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
        onBlur={(e) => e.target.style.borderColor = "#ddd"}
      />

      <ul style={{ display: "flex", flexDirection: "column", gap: 15, padding: 0 }}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div className="profile-user-block">
          <div className="profile-avatar-container">
            <div className="profile-avatar">P</div>
          </div>

          <div className="profile-user-info">
            <div className="profile-user-name">{user.name}</div>
            <div className="profile-user-email">{user.email}</div>
            
            <div className="profile-user-meta">
              <div className="profile-user-meta-item">
                <div className="profile-user-meta-label">Âge</div>
                <div className="profile-user-meta-value">
                  {user.age ? `${user.age} ans` : "Non renseigné"}
                </div>
              </div>
              <div className="profile-user-meta-item">
                <div className="profile-user-meta-label">Genre</div>
                <div className="profile-user-meta-value">
                  {user.gender || "Non renseigné"}
                </div>
              </div>
            </div>

          </div>
        </div>
          ))
        ) : (
          <p>
            {searchQuery 
              ? `Aucun utilisateur trouvé pour "${searchQuery}".` 
              : "Aucun utilisateur trouvé."}
          </p>
        )}
      </ul>
    </div>
  );
}