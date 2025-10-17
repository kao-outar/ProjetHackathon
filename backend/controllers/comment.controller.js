const Comment = require('../models/Comment.js');
const Post = require('../models/Post.js');

class CommentController {
  // GET /api/comments/ - Get all comments
  async getAllComments(req, res) {
    try {
      const comments = await Comment.find();
      res.json(comments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // POST /api/comments/ - Create a comment
  async createComment(req, res) {
    try {
      const { postId, content } = req.body;
      if (!postId || !content) {
        return res.status(400).json({ error: 'postId and content are required' });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      const comment = await Comment.create({
        post: postId,
        content,
        author: req.user._id,
        date_created: new Date(),
        date_updated: new Date(),
      });
      await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET /api/comments/post/:postId - Get all comments for a post
  async getCommentsByPost(req, res) {
    const { postId } = req.params;
    try {
      const comments = await Comment.find({ post: postId });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/comments/:commentId - Update a comment (author only)
  async updateComment(req, res) {
    const { commentId } = req.params;
    const { content } = req.body;
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Non autorisé' });
      }
      if (content !== undefined) comment.content = content;
      comment.date_updated = new Date();
      await comment.save();
      res.json(comment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/comments/:commentId - Delete a comment (author only)
  async deleteComment(req, res) {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Non autorisé' });
      }
      await Comment.findByIdAndDelete(commentId);
      // Retirer le commentaire de la liste du post
      await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
      res.json({ message: 'Commentaire supprimé' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new CommentController();
