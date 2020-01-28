const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  between: [String],
  from: String,
  to: String,
  message: {
    text: String,
    createdAt: Date
    // createdAt: { type: Date, default: Date.now() }
  }
});

mongoose.model('Message', messageSchema);