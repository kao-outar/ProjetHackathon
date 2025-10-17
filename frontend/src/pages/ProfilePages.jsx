import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import API from "../api/axiosClient";
import { getUserPosts, updatePost, deletePost } from "../api/post";
import "../styles/profile.css";

export default function ProfilePage() {
  const { userId } = useParams(); // optionnel : si pas présent => profil perso
  const { user: currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 États pour la modification
  const [editingPostId, setEditingPostId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [editLoading, setEditLoading] = useState(false);

  // 🔹 États pour la suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🔹 État pour la notification de succès
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  // 🔹 Démarrer l'édition
  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditForm({ title: post.title, content: post.content });
  };

  // 🔹 Annuler l'édition
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditForm({ title: "", content: "" });
  };

  // 🔹 Sauvegarder les modifications
  const handleSaveEdit = async (postId) => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert("Le titre et le contenu sont requis");
      return;
    }

    try {
      setEditLoading(true);
      const updatedPost = await updatePost(
        postId,
        editForm.title,
        editForm.content,
        currentUser._id
      );
      
      // Mettre à jour le post dans la liste locale
      setPosts(posts.map(p => p._id === postId ? { ...p, ...updatedPost } : p));
      setEditingPostId(null);
      setEditForm({ title: "", content: "" });
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      alert("Impossible de modifier le post");
    } finally {
      setEditLoading(false);
    }
  };

  // 🔹 Ouvrir la modal de suppression
  const handleOpenDeleteModal = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  // 🔹 Fermer la modal de suppression
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  // 🔹 Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setDeleteLoading(true);
      await deletePost(postToDelete._id, currentUser._id);
      
      // Retirer le post de la liste locale
      setPosts(posts.filter(p => p._id !== postToDelete._id));
      handleCloseDeleteModal();
      
      // Afficher la notification de succès
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Impossible de supprimer le post");
    } finally {
      setDeleteLoading(false);
    }
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
                  {editingPostId === post._id ? (
                    // 🔸 Mode édition
                    <div className="profile-post-edit-form">
                      <input
                        type="text"
                        className="profile-post-edit-title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Titre"
                        disabled={editLoading}
                      />
                      <textarea
                        className="profile-post-edit-content"
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        placeholder="Contenu"
                        rows="4"
                        disabled={editLoading}
                      />
                      <div className="profile-post-edit-actions">
                        <button
                          className="profile-post-save-btn"
                          onClick={() => handleSaveEdit(post._id)}
                          disabled={editLoading}
                        >
                          {editLoading ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                        <button
                          className="profile-post-cancel-btn"
                          onClick={handleCancelEdit}
                          disabled={editLoading}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 🔸 Mode affichage
                    <div className="profile-post-display">
                      {isOwnProfile && (
                        <button
                          className="profile-post-delete-btn"
                          onClick={() => handleOpenDeleteModal(post)}
                          title="Supprimer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      )}
                      
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
                      
                      {isOwnProfile && (
                        <div className="profile-post-actions">
                          <button
                            className="profile-post-edit-btn"
                            onClick={() => handleStartEdit(post)}
                          >
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* 🔸 Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="delete-modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">Supprimer le post</h3>
            <p className="delete-modal-text">
              Êtes-vous sûr de vouloir supprimer votre post ?
            </p>
            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel-btn"
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                className="delete-modal-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔸 Toast de succès */}
      {showSuccessToast && (
        <div className="success-toast">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Post supprimé avec succès</span>
        </div>
      )}
    </div>
  );
}
