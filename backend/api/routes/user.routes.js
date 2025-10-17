
const router = require('express').Router();
const verifyToken = require('../../middleware/verifyToken');
const userController = require('../../controllers/user.controller.js');

router.get('/', verifyToken(false), userController.getAllUsers);
router.get('/:id', verifyToken(false), userController.getUserById);
router.put('/:id', verifyToken(true), userController.updateUser);

module.exports = router;