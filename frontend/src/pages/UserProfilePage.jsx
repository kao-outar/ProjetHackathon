import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axiosClient";
import "../styles/user-profile.css";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await API.get(`/users/${userId}`);
        setUser(res.data.user);
      } catch (err) {
        console.error("Erreur:", err);
        navigate("/");
      }
    }

    async function fetchUserPosts() {
      try {
        const res = await API.get(`/posts/user/${userId}`);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Erreur:", err);
      }
    }

    fetchUserData();
    fetchUserPosts();
    setLoading(false);
  }, [userId, navigate]);

  if (loading) return <div className="user-profile-loading">Chargement...</div>;
  if (!user) return <div className="user-profile-error">Utilisateur introuvable</div>;

  const avatarLetter = user.name?.charAt(0).toUpperCase() || "U";
  const isOwnProfile = currentUser?.uuid === user.uuid;

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <button className="user-profile-back-btn" onClick={() => navigate("/")}>
          ← Retour
        </button>
      </div>

      <div className="user-profile-content">
        {/* Bloc Utilisateur */}
        <div className="user-profile-block">
          <div className="user-profile-avatar">{avatarLetter}</div>

          <div className="user-profile-info">
            <div className="user-profile-name">{user.name}</div>
            <div className="user-profile-email">{user.email}</div>
            
            <div className="user-profile-meta">
              <div className="user-profile-meta-item">
                <div className="user-profile-meta-label">Âge</div>
                <div className="user-profile-meta-value">
                  {user.age ? `${user.age} ans` : "Non renseigné"}
                </div>
              </div>
              <div className="user-profile-meta-item">
                <div className="user-profile-meta-label">Genre</div>
                <div className="user-profile-meta-value">
                  {user.gender || "Non renseigné"}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <button 
                className="user-profile-edit-btn"
                onClick={() => navigate("/profile/edit")}
              >
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* Bloc Posts */}
        <div className="user-profile-posts-block">
          <h2>Posts de {user.name} ({posts.length})</h2>

          {posts.length > 0 ? (
            <div className="user-profile-posts-list">
              {posts.map((post) => (
                <div key={post.id} className="user-profile-post-card">
                  <div className="user-profile-post-title">{post.title}</div>
                  <div className="user-profile-post-content">{post.content}</div>
                  <div className="user-profile-post-date">
                    {new Date(post.date).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="user-profile-posts-empty">
              {isOwnProfile 
                ? "Vous n'avez pas encore publié de posts."
                : `${user.name} n'a pas encore publié de posts.`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}