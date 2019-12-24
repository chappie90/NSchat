const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  between: [String],
  from: String,
  to: String,
  message: {
    text: String,
    createdAt: Date
  }
});

mongoose.model('Message', messageSchema);