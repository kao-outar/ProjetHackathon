const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  age: Number,
  gender: String,
  icon: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  date_created: { type: Date, default: Date.now },
  date_updated: { type: Date, default: Date.now },
  token: String,
  token_expiration: Date,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
});

// 🔧 Modèle
const User = mongoose.model('User', userSchema);

module.exports = User;
