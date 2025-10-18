import { useState } from "react";
import { createPost } from "../../api/post";
import "../../styles/create-post-modal.css";

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const authorId = user?._id || user?.id;
      if (!authorId) throw new Error("User not found or invalid format.");

      const post = await createPost(title, content); // no need to pass authorId anymore

      onPostCreated(post);
      setTitle("");
      setContent("");
      onClose();
    } catch (err) {
      console.error("Error while creating post:", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a Post</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              placeholder="Enter your post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              placeholder="Write your post here..."
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
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-submit"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
