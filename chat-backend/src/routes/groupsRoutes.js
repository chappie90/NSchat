const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const Group = mongoose.model('Group');
const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

const MIME_TYPE_GROUP_AVATAR = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_GROUP_AVATAR[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, './public/uploads/');
  },
  filename: (req, file, cb) => {
    const name = file.originalname;
    const ext = MIME_TYPE_GROUP_AVATAR[file.mimetype];
    cb(null, name + '_' + Date.now() + '.' + ext);
  }
});

router.get('/group', checkAuth, async (req, res) => {
  const groupId = req.query.groupId;

  console.log(groupId);

  try {
    const group = await Group.find({ _id: groupId });

    if (!group) {
      return res.status(422).send({ error: 'Could not fetch image' }); 
    }

    res.status(200).send({ group: group[0] });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not fetch image' });
  }
});

module.exports = router;