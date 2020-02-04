const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  between: [String],
  from: String,
  to: String,
  message: {
    id: String, 
    text: String,
    createdAt: Date
    // createdAt: { type: Date, default: Date.now() }
  },
  read: { type: Boolean, default: false }
});

mongoose.model('Message', messageSchema);