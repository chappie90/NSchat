const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const User = mongoose.model('User');
const Message = mongoose.model('Message');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

const MIME_TYPE_PROFILE = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_PROFILE[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, './public/uploads/');
  },
  filename: (req, file, cb) => {
    console.log(file)
    const name = file.originalname;
    console.log(name);
    const ext = MIME_TYPE_PROFILE[file.mimetype];
    cb(null, `${name}`);
  }
});

router.post(
  '/image/upload', 
  checkAuth, 
  multer({ storage: storage }).single('profile'),
  async (req, res) => {
    try {
      console.log('success');
      res.status(200).send({ msg: 'success' });
    } catch (err) {
      res.status(422).send(err.message);
    }
});

module.exports = router;