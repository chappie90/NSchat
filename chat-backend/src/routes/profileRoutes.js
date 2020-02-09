const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

router.post('/image/upload', checkAuth, async (req, res) => {
  console.log(req.body);

  try {

  } catch (err) {
    return res.status(422).send(err.message);
  }

});

module.exports = router;