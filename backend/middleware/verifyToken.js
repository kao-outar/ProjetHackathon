const User = require('../models/User');
const bcrypt = require('bcrypt');

// Middleware to verify token on protected routes

function verifyToken(attachUser = false) {
    return async (req, res, next) => {
        try {
            const clientToken = req.headers['x-client-token'];
            const userId = req.headers['x-user-id'];
            if (!clientToken || !userId) {
                return res.status(401).json({ error: 'client_token_and_user_id_required' });
            }
            const user = await User.findOne({
                _id: userId,
                token_expiration: { $gt: new Date() }
            });
            if (!user) {
                return res.status(401).json({ error: 'expired_token' });
            }
            const isValidToken = await bcrypt.compare(clientToken, user.token);
            if (!isValidToken) {
                return res.status(401).json({ error: 'invalid_token' });
            }
            if (attachUser) req.user = user;
            next();
        } catch (e) {
            console.log('Token verification error:', e);
            return res.status(500).json({ error: 'server_error', details: e.message });
        }
    }
};
module.exports = verifyToken;
