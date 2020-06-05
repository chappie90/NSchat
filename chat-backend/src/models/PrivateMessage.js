const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  privateChat: { type: mongoose.Schema.Types.ObjectId, ref: 'PrivateChat' },
  between: [String],
  from: String,
  to: String,
  message: {
    id: String, 
    text: String,
    createdAt: Date
    // createdAt: { type: Date, default: Date.now() }
  },
  read: { type: Boolean, default: false },
  delivered: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  replyTo: { 
    messageId: String,
    messageText: String,
    messageAuthor: String
  },
  image: {
    imgPath: String,
    imgName: String
  }
});

mongoose.model('PrivateMessage', privateMessageSchema);