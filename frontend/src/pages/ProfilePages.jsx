import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import API from "../api/axiosClient";
import { getUserPosts, updatePost, deletePost } from "../api/post";
import { getCommentsByPost, createComment, deleteComment, updateComment } from "../api/comment";
import "../styles/profile.css";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
} from "react-icons/fi";

export default function ProfilePage() {
  const { userId } = useParams();
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

  // 🔹 États pour les commentaires
  const [commentsVisible, setCommentsVisible] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // 🔹 Vérifie si on est sur notre propre profil
  const isOwnProfile =
    !userId || userId === currentUser?._id || userId === currentUser?.uuid;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isOwnProfile) {
          setUser(currentUser);
        } else {
          const res = await API.get(`/users/${userId}`);
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("User fetch error:", err);
        setError("Failed to load profile.");
      }
    };

    if (!loading) fetchUser();
  }, [userId, currentUser, isOwnProfile, loading]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      try {
        setPostsLoading(true);
        const userPosts = await getUserPosts(user._id || user.id);
        setPosts(userPosts.sort((a, b) => new Date(b.date_created) - new Date(a.date_created)));

      } catch (err) {
        console.error("Post fetch error:", err);
        setError("Failed to load posts.");
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

  // 🔹 Toggle comments visibility and load comments
  const toggleComments = async (postId) => {
    const isVisible = commentsVisible[postId];
    
    // Toggle visibility immediately
    setCommentsVisible(prev => ({ ...prev, [postId]: !isVisible }));
    
    // Load comments only if opening and not already loaded
    if (!isVisible && !comments[postId]) {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      try {
        const postComments = await getCommentsByPost(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  // 🔹 Add a comment
  const handleAddComment = async (postId) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    // Clear input immediately for better UX
    setNewComment(prev => ({ ...prev, [postId]: "" }));

    try {
      const comment = await createComment(postId, content);
      
      // Update comments list
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      
      // Update post comments count
      setPosts(prev => prev.map((p) => {
        if (p._id === postId) {
          return { ...p, comments: [...(p.comments || []), comment._id] };
        }
        return p;
      }));
    } catch (err) {
      console.error("Error adding comment:", err);
      // Restore input on error
      setNewComment(prev => ({ ...prev, [postId]: content }));
    }
  };

  // 🔹 Delete a comment with optimistic update
  const handleDeleteComment = async (postId, commentId) => {
    // Optimistic update - remove immediately
    const oldComments = comments[postId];
    
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].filter((c) => c._id !== commentId)
    }));
    
    setPosts(prev => prev.map((p) => {
      if (p._id === postId) {
        return { ...p, comments: (p.comments || []).filter((id) => id !== commentId) };
      }
      return p;
    }));

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error("Error deleting comment:", err);
      // Revert on error
      setComments(prev => ({ ...prev, [postId]: oldComments }));
      setPosts(prev => prev.map((p) => {
        if (p._id === postId) {
          return { ...p, comments: [...(p.comments || []), commentId] };
        }
        return p;
      }));
    }
  };

  // 🔹 Handle user click
  const handleUserClick = (userId) => {
    if (!userId) return;
    if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  // 🔹 Check if user owns the comment
  const isCommentOwner = (comment) => {
    if (!currentUser || !comment || !comment.author) return false;
    
    const userId = currentUser._id || currentUser.id;
    const authorId = comment.author._id || comment.author.id;
    
    return userId && authorId && userId.toString() === authorId.toString();
  };

  // 🔹 Start editing a comment
  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  // 🔹 Cancel editing a comment
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  // 🔹 Save edited comment with optimistic update
  const handleSaveEditComment = async (postId, commentId) => {
    const content = editCommentContent.trim();
    if (!content) return;

    // Save old content for revert
    const oldComment = comments[postId].find(c => c._id === commentId);
    
    // Optimistic update
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].map((c) => 
        c._id === commentId ? { ...c, content, date_updated: new Date() } : c
      )
    }));
    
    // Reset editing state immediately
    setEditingCommentId(null);
    setEditCommentContent("");

    try {
      const updatedComment = await updateComment(commentId, content);
      
      // Update with real data from server
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map((c) => 
          c._id === commentId ? updatedComment : c
        )
      }));
    } catch (err) {
      console.error("Error updating comment:", err);
      // Revert on error
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map((c) => 
          c._id === commentId ? oldComment : c
        )
      }));
    }
  };

  if (loading || !user) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        {isOwnProfile && (
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* === USER INFO === */}
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
                <div className="profile-user-meta-label">Age</div>
                <div className="profile-user-meta-value">
                  {user.age ? `${user.age} years` : "Not specified"}
                </div>
              </div>
              <div className="profile-user-meta-item">
                <div className="profile-user-meta-label">Gender</div>
                <div className="profile-user-meta-value">
                  {user.gender || "Not specified"}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <button className="profile-edit-btn" onClick={handleEdit}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* === USER POSTS === */}
        <div className="profile-posts-block">
          <h2>
            {isOwnProfile
              ? `My Posts (${posts.length})`
              : `${user.name}'s Posts (${posts.length})`}
          </h2>

          {postsLoading ? (
            <div className="profile-posts-loading">Loading posts...</div>
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
                      
                      <div className="profile-post-actions">
                        {isOwnProfile && (
                          <button
                            className="profile-post-edit-btn"
                            onClick={() => handleStartEdit(post)}
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          className="profile-post-comments-btn"
                          onClick={() => toggleComments(post._id)}
                        >
                          💬 Commentaires ({comments[post._id]?.length || post.comments?.length || 0})
                        </button>
                      </div>

                      {/* Section des commentaires */}
                      {commentsVisible[post._id] && (
                        <div className="profile-comments-section">
                          {loadingComments[post._id] ? (
                            <div className="profile-comments-loading">Chargement des commentaires...</div>
                          ) : (
                            <>
                              {/* Liste des commentaires */}
                              <div className="profile-comments-list">
                                {comments[post._id] && comments[post._id].length > 0 ? (
                                  comments[post._id].map((comment) => (
                                    <div key={comment._id} className="profile-comment">
                                      {editingCommentId === comment._id ? (
                                        // Mode édition
                                        <div className="profile-comment-edit-form">
                                          <textarea
                                            className="profile-comment-edit-input"
                                            value={editCommentContent}
                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                            rows="3"
                                            autoFocus
                                          />
                                          <div className="profile-comment-edit-actions">
                                            <button
                                              className="profile-comment-save-btn"
                                              onClick={() => handleSaveEditComment(post._id, comment._id)}
                                            >
                                              Sauvegarder
                                            </button>
                                            <button
                                              className="profile-comment-cancel-btn"
                                              onClick={handleCancelEditComment}
                                            >
                                              Annuler
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        // Mode affichage
                                        <>
                                          <div className="profile-comment-header">
                                            <div
                                              className="profile-comment-avatar"
                                              onClick={() => handleUserClick(comment.author._id)}
                                            >
                                              {comment.author?.icon ? (
                                                <img
                                                  src={comment.author.icon}
                                                  alt={comment.author.name}
                                                  className="profile-comment-avatar-img"
                                                />
                                              ) : (
                                                comment.author?.name?.charAt(0).toUpperCase() || "U"
                                              )}
                                            </div>
                                            <div className="profile-comment-info">
                                              <div
                                                className="profile-comment-username"
                                                onClick={() => handleUserClick(comment.author._id)}
                                              >
                                                {comment.author?.name}
                                              </div>
                                              <div className="profile-comment-date">
                                                {new Date(comment.date_created).toLocaleDateString("fr-FR", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </div>
                                            </div>
                                            {isCommentOwner(comment) && (
                                              <div className="profile-comment-actions">
                                                <button
                                                  className="profile-comment-edit"
                                                  onClick={() => handleStartEditComment(comment)}
                                                  title="Modifier le commentaire"
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                  >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                  </svg>
                                                </button>
                                                <button
                                                  className="profile-comment-delete"
                                                  onClick={() => handleDeleteComment(post._id, comment._id)}
                                                  title="Supprimer le commentaire"
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
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
                                              </div>
                                            )}
                                          </div>
                                          <div className="profile-comment-content">
                                            {comment.content}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="profile-comments-empty">
                                    Aucun commentaire pour le moment
                                  </div>
                                )}
                              </div>

                              {/* Formulaire d'ajout de commentaire */}
                              {currentUser && (
                                <div className="profile-comment-form">
                                  <input
                                    type="text"
                                    placeholder="Ajouter un commentaire..."
                                    value={newComment[post._id] || ""}
                                    onChange={(e) =>
                                      setNewComment({
                                        ...newComment,
                                        [post._id]: e.target.value,
                                      })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleAddComment(post._id);
                                      }
                                    }}
                                    className="profile-comment-input"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post._id)}
                                    className="profile-comment-submit"
                                    disabled={!newComment[post._id]?.trim()}
                                  >
                                    Envoyer
                                  </button>
                                </div>
                              )}
                            </>
                          )}
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
                ? "You haven’t published any posts yet."
                : `${user.name} hasn’t published any posts yet.`}
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
