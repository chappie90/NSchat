const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); 
const axios = require('axios');

const User = mongoose.model('User');
const checkAuth = require('../middlewares/checkAuth');
const setCloudinaryTransformUrl = require('../helpers/setCloudinaryTransformUrl');

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dycqqk3s6/upload';

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
  multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).single('profile'),
  async (req, res, next) => {
    const username = req.body.user;
    const url = req.protocol + '://' + req.get('host');
    const imgPath = url + '/public/uploads/' + req.file.filename;
    const base64 = req.body.base64;

    try {
  
      let cloudinaryData = {
        file: base64,
        upload_preset: 'ml_default'
      };     

      const response = await axios.post(CLOUDINARY_URL, cloudinaryData);

      if (response.status !== 200) {
        return res.status(422).send({ error: 'Could not save image' });
      }

      let urlParts = response.data.url.split('/');
      urlParts.splice(-2, 1);
      let url = urlParts.join('/');

      const user = await User.findOneAndUpdate(
        { username: username },
        { profile: {
            imgPath,
            imgName: req.file.filename,
            cloudinaryImgPath_150: setCloudinaryTransformUrl(url, 150),
            cloudinaryImgPath_200: setCloudinaryTransformUrl(url, 200),
            cloudinaryImgPath_400: setCloudinaryTransformUrl(url, 400)
        } },
        { new: true }
      );

      if (!user) {
        return res.status(422).send({ error: 'Could not save image' });
      } 

      res.status(200).send({ img: user.profile.cloudinaryImgPath_400, transformedImg: user.profile.cloudinaryImgPath_200 });
    } catch (err) {
      next(err);
      res.status(422).send({ error: 'Could not save image' });
    }
});

router.patch('/image/delete', checkAuth, async (req, res) => {
  const username = req.body.username;

  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { profile: {} },
      { new: true }
    );

    if (!user) {
      return res.status(422).send({ error: 'Could not delete image' });
    }

    res.status(200).send({ user });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not delete image' });
  }
});

router.get('/image', checkAuth, async (req, res, next) => {
  const username = req.query.user;
  let modifiedPath;

  try {
    const user = await User.find({ username });

    if (!user) {
      return res.status(422).send({ error: 'Could not fetch image' }); 
    }
    
    res.status(200).send({ image: user[0].profile.cloudinaryImgPath_400 });
  } catch (err) {
    next(err);
    res.status(422).send({ error: 'Could not fetch image' });
  }
});

module.exports = router;