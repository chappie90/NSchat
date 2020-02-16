const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  members: [String],
  created: { type: Date, required: true, default: Date.now() },
  avatar: {
    imagePath: String,
    imageName: String 
  }
});

mongoose.model('Group', groupSchema);