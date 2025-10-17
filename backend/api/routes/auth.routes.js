// ./api/routes/auth.routes.js
const router = require('express').Router();
const authController = require('../../controllers/auth.controller.js');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.post('/verify', authController.verify);

module.exports = router;
