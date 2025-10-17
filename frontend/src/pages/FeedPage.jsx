import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllPosts } from "../api/post";
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
        setPosts(data);
      } catch (err) {
        console.error("Erreur lors du chargement des posts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (authLoading || loading) {
    return <div className="feed-loading">Chargement...</div>;
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Fil d'actualité</h1>
        <button 
          className="feed-profile-btn"
          onClick={() => navigate("/profile")}
        >
          Mon profil
        </button>
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
            {posts.map((post) => (
              <div key={post._id} className="feed-post-card">
                <div className="feed-post-header">
                  <div 
                    className="feed-post-avatar"
                    onClick={() => handleUserClick(post.author._id)}
                  >
                    {post.author?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="feed-post-user-info">
                    <div 
                      className="feed-post-username"
                      onClick={() => handleUserClick(post.author._id)}
                    >
                      {post.author?.name}
                    </div>
                    <div className="feed-post-date">
                      {new Date(post.date_created).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                <div className="feed-post-content">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>

                <div className="feed-post-actions">
                  <button className="feed-action-btn">👍 J'aime</button>
                  <button className="feed-action-btn">💬 Commenter</button>
                </div>
              </div>
            ))}
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
          userId={user?._id || user?.id} // 🔹 ici aussi
          onPostCreated={handlePostCreated}
      />

    </div>
  );
}