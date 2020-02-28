const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  type: { type: String, default: 'group' },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  participants: [
    { user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }
  ],
  created: { type: Date, default: Date.now() },
  avatar: {
    imagePath: String,
    imageName: String 
  },
  pinned: { type: Boolean, default: false }
});

mongoose.model('Group', groupSchema);