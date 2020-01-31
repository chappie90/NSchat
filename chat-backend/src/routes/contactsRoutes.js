const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

router.post('/contacts/search', checkAuth, async (req, res) => {
  const { username } = req.body;

  let { search } = req.body;
  search = search.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&");

  try {
    if (search) {
      const contacts = await User.find({ username: { $regex: search, $ne: username } }, { username: 1, _id: 0 }).limit(10);
      if (contacts.length == 0) {
        return res.send({ contacts: [] });
      }
      return res.send({ contacts });
    }
    res.send({ contacts: [] });  
  } catch (err) {
    console.log(err);
    return res.status(422).send(err.message);
  }
});

router.post('/contacts/add', checkAuth, async (req, res) => {
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

router.post('/contacts', checkAuth, async (req, res) => {
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

module.exports = router;