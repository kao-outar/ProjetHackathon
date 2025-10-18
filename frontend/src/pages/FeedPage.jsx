import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllPosts, toggleLikePost } from "../api/post";
import { getCommentsByPost, createComment, deleteComment, updateComment } from "../api/comment";
import CreatePostModal from "../components/post/CreatePostModal";
import "../styles/feed.css";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getAllPosts();
        setPosts(data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created)));
      } catch (err) {
        console.error("❌ Error while loading posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleUserClick = (userId) => {
    if (!userId) return;
    if (user && (user._id === userId || user.id === userId)) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  // 🔹 Handle post like with optimistic update
  const handleLike = async (postId) => {
    // Optimistic update - Update UI immediately
    const userId = user._id || user.id;
    setPosts(posts.map((p) => {
      if (p._id === postId) {
        const isLiked = p.likes.some(likeUser => 
          (likeUser._id === userId || likeUser.id === userId)
        );
        
        if (isLiked) {
          // Remove like
          return {
            ...p,
            likes: p.likes.filter(likeUser => 
              likeUser._id !== userId && likeUser.id !== userId
            )
          };
        } else {
          // Add like
          return {
            ...p,
            likes: [...p.likes, { _id: userId, id: userId }]
          };
        }
      }
      return p;
    }));

    // Then update on server
    try {
      const response = await toggleLikePost(postId);
      const updatedPost = response.post;
      // Update with real data from server
      setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Error while liking post:", err);
      // Revert on error
      const data = await getAllPosts();
      setPosts(data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created)));
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

  // 🔹 Check if user owns the comment
  const isCommentOwner = (comment) => {
    if (!user || !comment || !comment.author) return false;
    
    const userId = user._id || user.id;
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

  if (authLoading || loading) {
    return <div className="feed-loading">Loading...</div>;
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>News Feed</h1>
        {user && (
          <button
            className="feed-profile-btn"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>
        )}
      </div>

      <div className="feed-content">
        {user && (
          <button
            className="feed-create-post-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Create a Post
          </button>
        )}

        {posts.length > 0 ? (
          <div className="feed-posts">
            {posts.map((post) => {
              const likedByUser = post.likes.some(
                (likeUser) => likeUser._id === user._id
              );

              return (
                <div key={post._id} className="feed-post-card">
                  <div className="feed-post-header">
                    <div
                      className="feed-post-avatar"
                      onClick={() => handleUserClick(post.author._id)}
                    >
                      {post.author?.icon ? (
                        <img
                          src={post.author.icon}
                          alt={post.author.name}
                          className="feed-post-avatar-img"
                        />
                      ) : (
                        post.author?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="feed-post-user-info">
                      <div
                        className="feed-post-username"
                        onClick={() => handleUserClick(post.author._id)}
                      >
                        {post.author?.name}
                      </div>
                      <div className="feed-post-date">
                        {new Date(post.date_created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="feed-post-content">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                  </div>

                  <div className="feed-post-actions">
                    <button
                      className="feed-action-btn"
                      onClick={() => handleLike(post._id)}
                      style={{ color: likedByUser ? "#2a5298" : "#555" }}
                    >
                      👍 Like ({post.likes.length})
                    </button>
                    <button 
                      className="feed-action-btn"
                      onClick={() => toggleComments(post._id)}
                    >
                      💬 Comment ({comments[post._id]?.length || post.comments?.length || 0})
                    </button>
                  </div>

                  {/* Section des commentaires */}
                  {commentsVisible[post._id] && (
                    <div className="feed-comments-section">
                      {loadingComments[post._id] ? (
                        <div className="feed-comments-loading">Loading comments...</div>
                      ) : (
                        <>
                          {/* Liste des commentaires */}
                          <div className="feed-comments-list">
                            {comments[post._id] && comments[post._id].length > 0 ? (
                              comments[post._id].map((comment) => (
                                <div key={comment._id} className="feed-comment">
                                  {editingCommentId === comment._id ? (
                                    // Mode édition
                                    <div className="feed-comment-edit-form">
                                      <textarea
                                        className="feed-comment-edit-input"
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        rows="3"
                                        autoFocus
                                      />
                                      <div className="feed-comment-edit-actions">
                                        <button
                                          className="feed-comment-save-btn"
                                          onClick={() => handleSaveEditComment(post._id, comment._id)}
                                        >
                                          Sauvegarder
                                        </button>
                                        <button
                                          className="feed-comment-cancel-btn"
                                          onClick={handleCancelEditComment}
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    // Mode affichage
                                    <>
                                      <div className="feed-comment-header">
                                        <div
                                          className="feed-comment-avatar"
                                          onClick={() => handleUserClick(comment.author._id)}
                                        >
                                          {comment.author?.icon ? (
                                            <img
                                              src={comment.author.icon}
                                              alt={comment.author.name}
                                              className="feed-comment-avatar-img"
                                            />
                                          ) : (
                                            comment.author?.name?.charAt(0).toUpperCase() || "U"
                                          )}
                                        </div>
                                        <div className="feed-comment-info">
                                          <div
                                            className="feed-comment-username"
                                            onClick={() => handleUserClick(comment.author._id)}
                                          >
                                            {comment.author?.name}
                                          </div>
                                          <div className="feed-comment-date">
                                            {new Date(comment.date_created).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                        </div>
                                        {isCommentOwner(comment) && (
                                          <div className="feed-comment-actions">
                                            <button
                                              className="feed-comment-edit"
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
                                              className="feed-comment-delete"
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
                                      <div className="feed-comment-content">
                                        {comment.content}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="feed-comments-empty">
                                Aucun commentaire pour le moment
                              </div>
                            )}
                          </div>

                          {/* Formulaire d'ajout de commentaire */}
                          {user && (
                            <div className="feed-comment-form">
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
                                className="feed-comment-input"
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="feed-comment-submit"
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
              );
            })}
          </div>
        ) : (
          <div className="feed-empty">
            No posts yet. Be the first to create one!
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?._id || user?.id}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
