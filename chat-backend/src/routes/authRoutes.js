const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkAvailability = await User.find({ username: username });

    if (checkAvailability.length > 0) {
      return res.status(422).send({ message: 'Username already taken' });
    }

    const user = new User({ username, password, contacts: [] });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token, userId: user._id, username });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      console.log(err);
      return res.status(422).send({ message: 'Username already taken' });
    } else {
      return res.status(422).send({ message: 'Invalid username or password' });
    }
  }
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).send({ message: 'Please enter email and password' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(422).send({ message: 'Invalid username or password' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token, userId: user._id, username });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ message: 'Invalid username or password' });
  }
});

router.patch('/signout', async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { expoToken: null },
      { new: true }
    );

    if (!user) {
      return  res.status(422).send({ message: 'Something went wrong with your request' });
    }

    res.status(200).send({ message: 'User successfully signed out' });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ message: 'Could not sign out' });
  }
});

module.exports = router;