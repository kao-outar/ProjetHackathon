import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import API from "../api/axiosClient";
import { getUserPosts, updatePost, deletePost } from "../api/post";
import "../styles/profile.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 État pour onglets
  const [activeTab, setActiveTab] = useState("myPosts");

  // 🔹 États édition et suppression
  const [editingPostId, setEditingPostId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isOwnProfile =
    !userId || userId === currentUser?._id || userId === currentUser?.uuid;

  // 🔹 Récupération des infos utilisateur
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

  // 🔹 Récupération des posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      try {
        setPostsLoading(true);
        const userPosts = await getUserPosts(user._id || user.id);
        setPosts(
          userPosts.sort(
            (a, b) => new Date(b.date_created) - new Date(a.date_created)
          )
        );
      } catch (err) {
        console.error("Post fetch error:", err);
        setError("Failed to load posts.");
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const likedPosts = posts.filter((post) =>
    post.likes.some((u) => u._id === currentUser._id)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  // 🔹 Édition post
  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditForm({ title: post.title, content: post.content });
  };
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditForm({ title: "", content: "" });
  };
  const handleSaveEdit = async (postId) => {
    if (!editForm.title.trim() || !editForm.content.trim()) return;
    try {
      setEditLoading(true);
      const updatedPost = await updatePost(
        postId,
        editForm.title,
        editForm.content,
        currentUser._id
      );
      setPosts(posts.map((p) => (p._id === postId ? { ...p, ...updatedPost } : p)));
      handleCancelEdit();
    } catch (err) {
      console.error("Edit error:", err);
      alert("Cannot edit post");
    } finally {
      setEditLoading(false);
    }
  };

  // 🔹 Suppression post
  const handleOpenDeleteModal = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setDeleteLoading(true);
      await deletePost(postToDelete._id, currentUser._id);
      setPosts(posts.filter((p) => p._id !== postToDelete._id));
      handleCloseDeleteModal();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Cannot delete post");
    } finally {
      setDeleteLoading(false);
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

        {/* === TABS === */}
        {isOwnProfile && (
          <div className="profile-tabs">
            <button
              className={activeTab === "myPosts" ? "active" : ""}
              onClick={() => setActiveTab("myPosts")}
            >
              My Posts ({posts.length})
            </button>
            <button
              className={activeTab === "likedPosts" ? "active" : ""}
              onClick={() => setActiveTab("likedPosts")}
            >
              Liked Posts ({likedPosts.length})
            </button>
          </div>
        )}

        {/* === POSTS LIST === */}
        <div className="profile-posts-list">
          {postsLoading ? (
            <div className="profile-posts-loading">Loading posts...</div>
          ) : error ? (
            <div className="profile-posts-error">{error}</div>
          ) : activeTab === "myPosts" ? (
            posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  isOwnProfile={isOwnProfile}
                  editingPostId={editingPostId}
                  editForm={editForm}
                  editLoading={editLoading}
                  handleStartEdit={handleStartEdit}
                  handleCancelEdit={handleCancelEdit}
                  handleSaveEdit={handleSaveEdit}
                  handleOpenDeleteModal={handleOpenDeleteModal}
                />
              ))
            ) : (
              <p>You haven’t published any posts yet.</p>
            )
          ) : likedPosts.length > 0 ? (
            likedPosts.map((post) => (
              <PostCard key={post._id} post={post} isOwnProfile={isOwnProfile} />
            ))
          ) : (
            <p>You haven’t liked any posts yet.</p>
          )}
        </div>
      </div>

      {/* === DELETE MODAL === */}
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

// 🔹 Composant PostCard pour réutilisation
function PostCard({
  post,
  isOwnProfile,
  editingPostId,
  editForm,
  editLoading,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  handleOpenDeleteModal,
}) {
  const isEditing = editingPostId === post._id;
  return (
    <div className="profile-post-card">
      {isEditing ? (
        <div className="profile-post-edit-form">
          <input
            type="text"
            className="profile-post-edit-title"
            value={editForm.title}
            onChange={(e) => (editForm.title = e.target.value)}
            placeholder="Titre"
            disabled={editLoading}
          />
          <textarea
            className="profile-post-edit-content"
            value={editForm.content}
            onChange={(e) => (editForm.content = e.target.value)}
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
        <div className="profile-post-display">
          {isOwnProfile && handleOpenDeleteModal && (
            <button
              className="profile-post-delete-btn"
              onClick={() => handleOpenDeleteModal(post)}
            >
              <FiTrash2 />
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
          {isOwnProfile && handleStartEdit && (
            <button
              className="profile-post-edit-btn"
              onClick={() => handleStartEdit(post)}
            >
              <FiEdit2 />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
