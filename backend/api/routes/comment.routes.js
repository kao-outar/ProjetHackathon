const router = require('express').Router();
const Comment = require('../../models/Comment.js');
const Post = require('../../models/Post.js');
const verifyToken = require('../../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
    try {
		const comments = await Comment.find();
		res.json(comments);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
// Route: POST /api/comments/ - Create a comment
router.post('/', verifyToken, async (req, res) => {
	try {
		const { post, content, author } = req.body;
		if (!post || !content || !author) {
			return res.status(400).json({ error: 'post, content, and author are required' });
		}
		const comment = await Comment.create({
			post,
			content,
			author,
			date_created: new Date(),
			date_updated: new Date(),
		});
		// Ajout du commentaire dans le champ comments du post
		await Post.findByIdAndUpdate(post, { $push: { comments: comment._id } });
		res.status(201).json(comment);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: GET /api/comments/post/:postId - Get all comments for a post
router.get('/post/:postId', verifyToken, async (req, res) => {
	const { postId } = req.params;
	try {
		const comments = await Comment.find({ post: postId });
		res.json(comments);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: PUT /api/comments/:commentId - Update a comment (author only)
router.put('/:commentId', verifyToken, async (req, res) => {
	const { commentId } = req.params;
	const { author, content } = req.body;
	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({ error: 'Commentaire non trouvé' });
		}
		if (!author || comment.author.toString() !== author) {
			return res.status(403).json({ error: 'Non autorisé' });
		}
		if (content !== undefined) comment.content = content;
		comment.date_updated = new Date();
		await comment.save();
		res.json(comment);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: DELETE /api/comments/:commentId - Delete a comment (author only)
router.delete('/:commentId', verifyToken, async (req, res) => {
	const { commentId } = req.params;
	const { author } = req.body;
	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({ error: 'Commentaire non trouvé' });
		}
		if (!author || comment.author.toString() !== author) {
			return res.status(403).json({ error: 'Non autorisé' });
		}
		await Comment.findByIdAndDelete(commentId);
		// Retirer le commentaire de la liste du post
		await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });
		res.json({ message: 'Commentaire supprimé' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
