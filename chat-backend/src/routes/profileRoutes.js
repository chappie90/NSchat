const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const User = mongoose.model('User');
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
    const name = file.originalname;
    const ext = MIME_TYPE_PROFILE[file.mimetype];
    cb(null, `${name}`);
  }
});

router.post(
  '/image/upload', 
  checkAuth, 
  multer({ storage: storage }).single('profile'),
  async (req, res) => {
    const username = req.body.user;
    const url = req.protocol + '://' + req.get('host');
    try {
      const user = await User.update(
        { username: username },
        { profile: {
          imgPath: url + '/public/uploads/' + req.file.filename,
          imgName: req.file.originalname
        } },
        { new: true }
      );
      let response = user.nModified > 0 ? true : false;

      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not save image' });
    }
});

module.exports = router;