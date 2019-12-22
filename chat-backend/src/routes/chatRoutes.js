const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const router = express.Router();

router.post('/contacts/search', async (req, res) => {
  const { search } = req.body;

  try {
    if (search) {
      const contacts = await User.find({ username: { $regex: search } }, { username: 1, _id: 0 }).limit(10);
      res.send({ contacts });
    }  
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;