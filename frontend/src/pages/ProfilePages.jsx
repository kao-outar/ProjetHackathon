import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import API from "../api/axiosClient";
import {
  getUserPosts,
  updatePost,
  deletePost,
} from "../api/post";
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

  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

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

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleSavePost = async (postId) => {
    try {
      const updated = await updatePost(postId, editTitle, editContent, user._id);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? updated : p))
      );
      handleCancelEdit();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update post.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(postId, user._id);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete post.");
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
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="profile-edit-title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="profile-edit-content"
                      />
                      <div className="profile-post-actions">
                        <button
                          className="save-btn"
                          onClick={() => handleSavePost(post._id)}
                        >
                          <FiSave /> Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          <FiX /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="profile-post-header">
                        <h3 className="profile-post-title">{post.title}</h3>
                        {isOwnProfile && (
                          <div className="profile-post-icons">
                            <button
                              className="icon-btn edit"
                              onClick={() => handleEditPost(post)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="icon-btn delete"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="profile-post-content">{post.content}</p>
                      <div className="profile-post-date">
                        {new Date(post.date_created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </>
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
    </div>
  );
}
