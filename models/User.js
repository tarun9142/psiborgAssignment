const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  number: { type: String, required: true},
  roles: { type: [String],enum: ['User','Manager','Admin'], default: ['User'] },
  team: {type: mongoose.Schema.Types.ObjectId,ref: 'Team'}, // Reference to the Team model
  notificationPreferences: {type: String,enum: ['email', 'sms'],default: 'email'}
});

module.exports = mongoose.model('User', UserSchema);