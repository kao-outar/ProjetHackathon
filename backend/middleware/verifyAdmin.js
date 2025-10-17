// Middleware to verify that the user is an admin
// This middleware should be used after verifyToken(true) to ensure req.user is populated

function verifyAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'user_not_authenticated' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin_access_required' });
    }
    
    next();
  } catch (e) {
    console.error('Admin verification error:', e);
    return res.status(500).json({ error: 'server_error', details: e.message });
  }
}

module.exports = verifyAdmin;
