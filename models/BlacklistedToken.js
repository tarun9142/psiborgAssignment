const mongoose = require('mongoose');

// Define the Blacklisted Token Schema
const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600*6 // This automatically deletes the document after 6 hour
  }
});

// Create the BlacklistedToken model using the schema
const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

module.exports = BlacklistedToken;
