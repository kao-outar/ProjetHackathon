import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import API from "../api/axiosClient";
import { getUserPosts } from "../api/post";
import "../styles/profile.css";

export default function ProfilePage() {
  const { userId } = useParams(); // optionnel : si pas présent => profil perso
  const { user: currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Vérifie si on est sur notre propre profil
  const isOwnProfile =
    !userId || userId === currentUser?._id || userId === currentUser?.uuid;

  // 🔹 Récupère les infos utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isOwnProfile) {
          // Si c’est nous, on prend les données du contexte
          setUser(currentUser);
        } else {
          // Sinon, on va chercher l’autre utilisateur
          const res = await API.get(`/users/${userId}`);
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Erreur de récupération utilisateur :", err);
        setError("Impossible de charger le profil");
      }
    };

    if (!loading) fetchUser();
  }, [userId, currentUser, isOwnProfile, loading]);

  // 🔹 Récupère les posts de l’utilisateur
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      try {
        setPostsLoading(true);
        const userPosts = await getUserPosts(user._id || user.id);
        setPosts(userPosts);
      } catch (err) {
        console.error("Erreur lors du chargement des posts :", err);
        setError("Impossible de charger les posts");
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  if (loading || !user) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil</h1>
        {isOwnProfile && (
          <button className="profile-logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* 🔸 Bloc Utilisateur */}
        <div className="profile-user-block">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user.icon ? (
                <img
                  src={user.icon}
                  alt={`${user.name} avatar`}
                  className="profile-avatar-img"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
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

            {isOwnProfile && (
              <button className="profile-edit-btn" onClick={handleEdit}>
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* 🔸 Bloc Posts */}
        <div className="profile-posts-block">
          <h2>
            {isOwnProfile
              ? `Mes Posts (${posts.length})`
              : `Posts de ${user.name} (${posts.length})`}
          </h2>

          {postsLoading ? (
            <div className="profile-posts-loading">Chargement des posts...</div>
          ) : error ? (
            <div className="profile-posts-error">{error}</div>
          ) : posts.length > 0 ? (
            <div className="profile-posts-list">
              {posts.map((post) => (
                <div key={post._id} className="profile-post-card">
                  <div className="profile-post-title">{post.title}</div>
                  <div className="profile-post-content">{post.content}</div>
                  <div className="profile-post-date">
                    {new Date(post.date_created).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-posts-empty">
              {isOwnProfile
                ? "Vous n'avez pas encore publié de posts."
                : `${user.name} n'a pas encore publié de posts.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
