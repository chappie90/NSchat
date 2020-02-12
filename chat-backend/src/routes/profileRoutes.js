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
    cb(null, name + '_' + Date.now() + '.' + ext);
  }
});

router.post(
  '/image/upload', 
  checkAuth, 
  multer({ storage: storage }).single('profile'),
  async (req, res) => {
    const username = req.body.user;
    const url = req.protocol + '://' + req.get('host');
    const imgPath = url + '/public/uploads/' + req.file.filename;
    try {
      const user = await User.findOneAndUpdate(
        { username: username },
        { profile: {
          imgPath,
          imgName: req.file.filename
        } },
        { new: true }
      );

      if (!user) {
        return res.status(422).send({ error: 'Could not save image' });
      } 

      const path = user.profile.imgPath; 
      
      res.status(200).send({ img: path });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not save image' });
    }
});

router.get('/image', checkAuth, async (req, res) => {
  const username = req.query.user;

  try {
    const user = await User.find({ username });

    if (!user) {
      return res.status(422).send({ error: 'Could not fetch image' }); 
    }

    res.status(200).send({ image: user[0].profile.imgPath });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not fetch image' });
  }
});

module.exports = router;