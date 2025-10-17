
const router = require('express').Router();
const verifyToken = require('../../middleware/verifyToken');
const postController = require('../../controllers/post.controller.js');

router.get('/', verifyToken(false), postController.getAllPosts);
router.get('/user/:userId', verifyToken(false), postController.getPostsByUser);
router.post('/', verifyToken(true), postController.createPost);
router.put('/:postId', verifyToken(true), postController.updatePost);
router.delete('/:postId', verifyToken(true), postController.deletePost);
router.post('/:postId/like', verifyToken(true), postController.toggleLike);

module.exports = router;
