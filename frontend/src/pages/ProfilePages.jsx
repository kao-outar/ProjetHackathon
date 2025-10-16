import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/profile.css";

export default function ProfilePages() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setPosts([
        {
          id: 1,
          title: "Mon premier post",
          content: "Ceci est mon premier post sur le réseau social.",
          date: new Date("2025-10-14"),
        },
        {
          id: 2,
          title: "Un autre post",
          content: "Voici un autre contenu que j'ai publié.",
          date: new Date("2025-10-15"),
        },
      ]);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Chargement du profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          Vous devez être connecté pour accéder à cette page.
        </div>
      </div>
    );
  }

  // Première lettre du nom pour l'avatar
  const avatarLetter = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil</h1>
        <button className="profile-logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      <div className="profile-content">
        {/* Bloc Utilisateur */}
        <div className="profile-user-block">
          <div className="profile-avatar-container">
            <div className="profile-avatar">{avatarLetter}</div>
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

            <button className="profile-edit-btn" onClick={handleEdit}>
              Modifier le profil
            </button>
          </div>
        </div>

        {/* Bloc Posts */}
        <div className="profile-posts-block">
          <h2>Mes Posts ({posts.length})</h2>

          {posts.length > 0 ? (
            <div className="profile-posts-list">
              {posts.map((post) => (
                <div key={post.id} className="profile-post-card">
                  <div className="profile-post-title">{post.title}</div>
                  <div className="profile-post-content">{post.content}</div>
                  <div className="profile-post-date">
                    {post.date.toLocaleDateString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-posts-empty">
              Vous n'avez pas encore publié de posts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}