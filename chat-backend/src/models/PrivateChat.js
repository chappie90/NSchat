const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
  type: { type: 'String', default: 'private' },
  participants: [String],
  created: { type: Date, default: Date.now() },
  pinned: { type: Boolean, default: false }
});

mongoose.model('PrivateChat', privateChatSchema);