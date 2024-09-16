const mongoose = require('mongoose');

const environmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: Object, // This could hold various settings for the environment
});

module.exports = mongoose.model('Environment', environmentSchema);
