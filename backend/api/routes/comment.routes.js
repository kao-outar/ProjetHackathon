const router = require('express').Router();
const verifyToken = require('../../middleware/verifyToken');
const commentController = require('../../controllers/comment.controller.js');

router.get('/', verifyToken(false), commentController.getAllComments);
router.post('/', verifyToken(true), commentController.createComment);
router.get('/post/:postId', verifyToken(false), commentController.getCommentsByPost);
router.put('/:commentId', verifyToken(true), commentController.updateComment);
router.delete('/:commentId', verifyToken(true), commentController.deleteComment);

module.exports = router;
