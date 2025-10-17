const User = require('../models/User.js');
const Post = require('../models/Post.js');
const Comment = require('../models/Comment.js');

class KpiController {
  // GET /api/kpi - Get KPI data (admin only)
  async getKpis(req, res) {
    try {
      // Count total users
      const nbUser = await User.countDocuments();
      
      // Count users by gender
      const femaleUser = await User.countDocuments({ gender: 'female' });
      const maleUser = await User.countDocuments({ gender: 'male' });
      const otherGenderUser = await User.countDocuments({ gender: 'other' });
      const preferNotToSayUser = await User.countDocuments({ gender: 'prefer_not_to_say' });
      
      // Count total posts
      const nbPost = await Post.countDocuments();
      
      // Count total comments
      const nbComment = await Comment.countDocuments();
      
      // Calculate average age (excluding users without age)
      const usersWithAge = await User.find({ age: { $exists: true, $ne: null } }, { age: 1 });
      const avgAge = usersWithAge.length > 0
        ? usersWithAge.reduce((sum, user) => sum + user.age, 0) / usersWithAge.length
        : 0;
      
      
      // Get posts per user average
      const avgPostsPerUser = nbUser > 0 ? nbPost / nbUser : 0;
      
      // Get comments per post average
      const avgCommentsPerPost = nbPost > 0 ? nbComment / nbPost : 0;
      
      return res.status(200).json({
        users: {
          total: nbUser,
          byGender: {
            female: femaleUser,
            male: maleUser,
            other: otherGenderUser,
            preferNotToSay: preferNotToSayUser,
          },
          averageAge: Math.round(avgAge * 100) / 100,
        },
        posts: {
          total: nbPost,
          averagePerUser: Math.round(avgPostsPerUser * 100) / 100
        },
        comments: {
          total: nbComment,
          averagePerPost: Math.round(avgCommentsPerPost * 100) / 100
        }
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des KPIs:', err);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération des KPIs' });
    }
  }
}

module.exports = new KpiController();
