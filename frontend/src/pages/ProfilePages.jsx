import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserPosts } from "../api/post";
import "../styles/profile.css";

export default function ProfilePages() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user && user.id) {
        try {
          setPostsLoading(true);
          setPostsError(null);
          const userPosts = await getUserPosts(user.id);
          setPosts(userPosts);
        } catch (error) {
          console.error("Erreur lors du chargement des posts:", error);
          setPostsError("Impossible de charger les posts");
          setPosts([]);
        } finally {
          setPostsLoading(false);
        }
      }
    };

    fetchUserPosts();
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

          {postsLoading ? (
            <div className="profile-posts-loading">
              Chargement des posts...
            </div>
          ) : postsError ? (
            <div className="profile-posts-error">
              {postsError}
            </div>
          ) : posts.length > 0 ? (
            <div className="profile-posts-list">
              {posts.map((post) => (
                <div key={post._id} className="profile-post-card">
                  <div className="profile-post-title">{post.title}</div>
                  <div className="profile-post-content">{post.content}</div>
                  <div className="profile-post-date">
                    {new Date(post.date_created).toLocaleDateString("fr-FR", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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