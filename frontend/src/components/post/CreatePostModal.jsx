import { useState } from "react";
import { createPost } from "../../api/post";
import "../../styles/create-post-modal.css";

export default function CreatePostModal({ isOpen, onClose, userId, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  if (!title.trim() || !content.trim()) {
    setError("Le titre et le contenu sont obligatoires");
    setLoading(false);
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) throw new Error("User non trouvé ou mal formaté");

    const authorId = user._id;
    const post = await createPost(title, content, authorId); // ✅ MongoDB _id

    onPostCreated(post);
    setTitle("");
    setContent("");
    onClose();
  } catch (err) {
    console.error("Erreur lors de la création du post:", err.response?.data || err);
    setError(err.response?.data?.error || "Erreur lors de la création du post");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un post</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              placeholder="Le titre de votre post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenu</label>
            <textarea
              id="content"
              placeholder="Écrivez votre post ici..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              required
              rows="6"
            />
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-submit"
              disabled={loading}
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
