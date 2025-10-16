
const router = require('express').Router();
const Post = require('../../models/Post.js');
const User = require('../../models/User.js');
const verifyToken = require('../../middleware/verifyToken');


// Route: GET /api/posts/ - Get all posts
router.get('/', verifyToken, async (req, res) => {
	try {
		const posts = await Post.find().populate('comments');
		res.json(posts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: GET /api/posts/user/:userId - Get all posts by a specific user
router.get('/user/:userId', verifyToken, async (req, res) => {
	const { userId } = req.params;
	try {
		const user = await User.findById(userId).populate({
			path: 'posts',
			populate: { path: 'comments' }
		});
		if (!user) {
			return res.status(404).json({ error: 'Utilisateur non trouvé' });
		}
		res.json(user.posts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


// Route: POST /api/posts/ - Create a new post
router.post('/', verifyToken, async (req, res) => {
    console.log(req)
	try {
		const { title, content, author } = req.body;
		if (!title || !content || !author) {
			return res.status(400).json({ error: 'title, content, and author are required' });
		}
		const post = await Post.create({
			title,
			content,
			author,
			date_created: new Date(),
			date_updated: new Date(),
		});
		// Ajout du post dans le champ posts de l'utilisateur
		await User.findByIdAndUpdate(author, { $push: { posts: post._id } });
		res.status(201).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: PUT /api/posts/:postId - Update a post (author only)
router.put('/:postId', verifyToken, async (req, res) => {
	const { postId } = req.params;
	const { author, title, content } = req.body;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: 'Post non trouvé' });
		}
		if (!author || post.author.toString() !== author) {
			return res.status(403).json({ error: 'Non autorisé' });
		}
		if (title !== undefined) post.title = title;
		if (content !== undefined) post.content = content;
		post.date_updated = new Date();
		await post.save();
		res.json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route: DELETE /api/posts/:postId - Delete a post (author only)
router.delete('/:postId', verifyToken, async (req, res) => {
	const { postId } = req.params;
	const { author } = req.body;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: 'Post non trouvé' });
		}
		if (!author || post.author.toString() !== author) {
			return res.status(403).json({ error: 'Non autorisé' });
		}
		await Post.findByIdAndDelete(postId);
		// Retirer le post de la liste de l'utilisateur
		await User.findByIdAndUpdate(author, { $pull: { posts: postId } });
		res.json({ message: 'Post supprimé' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
module.exports = router;
