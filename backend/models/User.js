const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  age: Number,
  gender: String,
  date_created: { type: Date, default: Date.now },
  date_updated: { type: Date, default: Date.now }
});

// 🔧 Modèle
export const User = mongoose.model('User', userSchema);
