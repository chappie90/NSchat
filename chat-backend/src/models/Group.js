const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  type: { type: String, default: 'group' },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  participants: [String],
  created: { type: Date, default: Date.now() },
  avatar: {
    imagePath: String,
    imageName: String 
  }
});

mongoose.model('Group', groupSchema);