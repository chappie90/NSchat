const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

const router = express.Router();

router.post('/contacts/search', async (req, res) => {
  const { search } = req.body;

  try {
    if (search) {
      const contacts = await User.find({ username: { $regex: search } }, { username: 1, _id: 0 }).limit(10);
      if (contacts.length == 0) {
        return res.send({ contacts: [] });
      }
      res.send({ contacts });
    }  
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/contacts/add', async (req, res) => {
  const { username, contact } = req.body;

  try {
    const newContact = await User.findOneAndUpdate(
      { username: username },
      { $addToSet: {
          contacts: {
            username: contact,
            previousChat: 0
          }
        }
      },
      { new: true }
    );

    if (!newContact) {
      return  res.status(422).send({ error: 'Something went wrong with your request' });
    }

    res.send({ contact });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/contacts', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username }, { 'contacts.username': 1, _id: 0 });

    if (!user) {
      return res.status(422).send({ error: 'Something went wrong with your request' });
    }

    const contacts = user.contacts.map(c => c.username);
    
    res.send({ contacts });
  } catch (err) {
    return res.status(422).send(err.message);
  }

});

router.post('/chats', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.find({ username }); 

    const chats = user[0].contacts.filter(c => c.previousChat == true);

    console.log(chats);
    res.send({ chats });
  } catch (err) {
    return res.status(422).send(err.message);
  }

});

router.post('/messages', async (req, res) => {
  const { username, recipient } = req.body;

  try {
    const messages = await Message.find({ between: { $all: [username, recipient] } }, { from: 1, to: 1, message: 1 })
                                  .sort({ 'message.createdAt': -1 })
                                  .limit(20);

    res.send({ messages });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: 'Could not fetch messages' });
  }
});

module.exports = router;