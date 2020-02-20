const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  from: { type: String, required: true },
  message: {
    giftedChatId: { type: String },
    text: { type: String, required: true },
    created: { type: Date, required: true }
  },
  read: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  reply: {
    originalMsgId: String,
    originalMsgText: String,
    originalMsgAuthor: String
  }
});

mongoose.model('GroupMessage', groupMessageSchema);