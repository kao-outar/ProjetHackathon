import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllPosts, toggleLikePost } from "../api/post"; // 🔹 ajouter toggleLikePost
import CreatePostModal from "../components/post/CreatePostModal";
import "../styles/feed.css";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getAllPosts();
        setPosts(data.sort((a, b) => new Date(b.date_created) - new Date(a.date_created)));

      } catch (err) {
        console.error("Erreur lors du chargement des posts :", err);
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

  // 🔹 Fonction pour liker un post
  const handleLike = async (postId) => {
    try {
      const response = await toggleLikePost(postId);
      const updatedPost = response.post;

      // Mettre à jour localement la liste des posts
      setPosts(posts.map(p => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Erreur lors du like :", err);
    }
  };

  if (authLoading || loading) {
    return <div className="feed-loading">Chargement...</div>;
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Fil d'actualité</h1>
        {user && (
          <button
            className="feed-profile-btn"
            onClick={() => navigate("/profile")}
          >
            Mon profil
          </button>
        )}
      </div>

      <div className="feed-content">
        {user && (
          <button
            className="feed-create-post-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Créer un post
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
                        {new Date(post.date_created).toLocaleDateString("fr-FR", {
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
                      👍 J'aime ({post.likes.length})
                    </button>
                    <button className="feed-action-btn">💬 Commenter</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="feed-empty">
            Aucun post pour le moment. Soyez le premier à en créer un !
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
