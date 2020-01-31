const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

const checkAuth = require('../middlewares/checkAuth');

// // Speech stuff
// const fs = require('fs')
// const axios = require('axios')
// const speech = require('@google-cloud/speech');
// const ffmpeg = require('fluent-ffmpeg');

const router = express.Router();

// const client = new speech.SpeechClient();

router.post('/chats', checkAuth, async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.find({ username }); 

    const contacts = user[0].contacts.filter(c => c.previousChat == true);

    const chats = [];

    for (let c of contacts) {
      const lastMessage = await Message.find(
                                        { between: { $all: [username, c.username] } },
                                        { 'message.text': 1, 'message.createdAt': 1, _id: 0 })
                                        .sort({ 'message.createdAt': -1 })
                                        .limit(1);

      chats.push({ text: lastMessage[0].message.text, date: lastMessage[0].message.createdAt, contact: c.username });
    }

    res.send({ chats });
  } catch (err) {
    return res.status(422).send(err.message);
  }

});

router.post('/messages', checkAuth, async (req, res) => {
  const { username, recipient, page } = req.body;

  const skip = 50 * (page - 1);

  try {
    const messages = await Message.find({ between: { $all: [username, recipient] } }, { from: 1, to: 1, message: 1 })
                                  .skip(skip)
                                  .sort({ 'message.createdAt': -1 })
                                  .limit(50);

    res.send({ messages });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: 'Could not fetch messages' });
  }
});

// router.post('/speech', async (req, res) => {
//   console.log(req.body);

//   try {
  
//   } catch (err) {
//     console.log(err);
//     return res.status(422).send({ error: 'Could not fetch messages' });
//   }
// });

module.exports = router;