const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date_created: { type: Date, default: Date.now },
    date_updated: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);


module.exports = Comment;