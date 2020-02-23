const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const Group = mongoose.model('Group');
const User = mongoose.model('User');
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
  const groupId = req.query.chatId;

  try {
    if (groupId) {
      const group = await Group.find({ _id: groupId })
        .populate('participants.user');

    if (!group) {
      return res.status(422).send({ error: 'Could not fetch image' }); 
    }

      res.status(200).send({ group: group[0] });
    }
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not fetch image' });
  }
});

router.patch('/group/leave', checkAuth, async (req, res) => {
  const groupId = req.body.chatId;
  const userId = req.body.userId;

  try {
    const user = await User.update(
      { _id: userId },
      { $pull: {
        groups: {
          group: groupId
        }
      } },
      { new: true }
    );

    const group = await Group.update(
      { _id: groupId },
      { $pull: {
        participants: {
          user: userId 
        }
      } },
      { new: true }
    );
    
    res.status(200).send({ message: 'You\'ve left the group' });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Did not leave group successfully' })
  }
});

module.exports = router;