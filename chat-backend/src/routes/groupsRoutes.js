const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');

const Group = mongoose.model('Group');
const User = mongoose.model('User');
const GroupMessage = mongoose.model('GroupMessage');
const checkAuth = require('../middlewares/checkAuth');
const setCloudinaryTransformUrl = require('../helpers/setCloudinaryTransformUrl');

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dycqqk3s6/upload';

const router = express.Router();

const MIME_TYPE_GROUPIMAGE = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_GROUPIMAGE[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, './public/uploads');
  },
  filename: (req, file, cb) => {
    const nameArr = file.originalname.split(' ');
    const name = nameArr.join('-');
    const ext = MIME_TYPE_GROUPIMAGE[file.mimetype];
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
  const username = req.body.username;

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

   const userLeftGroupMessage = new GroupMessage({
      group:groupId,
      from: 'admin',
      message: {
        text: `${username} has left the group`,
        created: Date.now()
      }
    });
    await userLeftGroupMessage.save();
    
    res.status(200).send({ message: 'You\'ve left the group' });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Did not leave group successfully' })
  }
});

router.post(
  '/group/image/update', 
  checkAuth, 
  multer({ storage: storage }).single('groupImage'),
  async (req, res) => {
    const username = req.body.username;
    const groupId = req.body.chatId;

    let imgPath, cloudinaryUrl;

    try {

      if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imgPath = url + '/public/uploads/' + req.file.filename;

        const base64 = req.body.base64;
        let cloudinaryData = {
          file: base64,
          upload_preset: 'ml_default'
        };

        const response = await axios.post(CLOUDINARY_URL, cloudinaryData);

        if (response.status !== 200) {
          return res.status(422).send({ error: 'Could not update image' });
        }

        let urlParts = response.data.url.split('/');
        urlParts.splice(-2, 1);
        cloudinaryUrl = urlParts.join('/');
      }

      const group = await Group.findOneAndUpdate(
        { _id: groupId },
        { avatar: {
          imagePath: imgPath,
          imageName: req.file.filename,
          cloudinaryImgPath_150: setCloudinaryTransformUrl(cloudinaryUrl, 150),
          cloudinaryImgPath_200: setCloudinaryTransformUrl(cloudinaryUrl, 200),
          cloudinaryImgPath_400: setCloudinaryTransformUrl(cloudinaryUrl, 400)
        } },
        { new: true }
      ).populate('participants.user');

      if (!group) {
        return res.status(422).send({ error: 'Could not update image' });
      }  

     const updatedGroupImageMessage = new GroupMessage({
        group: groupId,
        from: 'admin',
        message: {
          text: `${username} updated the group image`,
          created: Date.now()
        }
      });
      await updatedGroupImageMessage.save();

      const adminMessage = {
        _id: updatedGroupImageMessage._id,
        text: updatedGroupImageMessage.message.text,
        createdAt:  updatedGroupImageMessage.message.created,
        user: {
          _id: 1,
          name: 'admin'
        }
      };

      console.log(group)
    
      res.status(200).send({ group, adminMessage });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not update image' });
    }
});

router.patch('/group/image/delete', checkAuth, async (req, res) => {
  const groupId = req.body.chatId;
  const username = req.body.username;

  try {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { avatar: {} },
      { new: true }
    ).populate('participants.user');

    if (!group) {
      return res.status(422).send({ error: 'Could not delete image' });
    }

    const deletedGroupImageMessage = new GroupMessage({
      group: groupId,
      from: 'admin',
      message: {
        text: `${username} deleted the group image`,
        created: Date.now()
      }
    });
    await deletedGroupImageMessage.save();

    const adminMessage = {
      _id: deletedGroupImageMessage._id,
      text: deletedGroupImageMessage.message.text,
      createdAt:  deletedGroupImageMessage.message.created,
      user: {
        _id: 1,
        name: 'admin'
      }
    };
  
    res.status(200).send({ group, adminMessage });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not delete image' });
  }
});

// router.patch('/group/name/update', checkAuth, async (req, res) => {
//   const groupId = req.body.chatId;
//   const groupName = req.body.groupName;
//   const username = req.body.username;

//   try {
//     const group = await Group.findOneAndUpdate(
//       { _id: groupId },
//       { name: groupName },
//       { new: true }
//     ).populate('participants.user');

//     if (!group) {
//       return res.status(422).send({ error: 'Could not update group name' });
//     }

//     const updatedGroupNameMessage = new GroupMessage({
//       group: groupId,
//       from: 'admin',
//       message: {
//         text: `${username} changed group name to '${groupName}'`,
//         created: Date.now()
//       }
//     });
//     await updatedGroupNameMessage.save();

//     const adminMessage = {
//       _id: updatedGroupNameMessage._id,
//       text: updatedGroupNameMessage.message.text,
//       createdAt:  updatedGroupNameMessage.message.created,
//       user: {
//         _id: 1,
//         name: 'admin'
//       }
//     };

//     res.status(200).send({ group, adminMessage });
//   } catch (err) {
//     console.log(err);
//     res.status(422).send({ error: 'Could not update group name' });
//   } 
// });

router.patch('/group/participants/add', checkAuth, async (req, res) => {
  const username = req.body.username;
  const groupId = req.body.chatId;
  const newMembers = req.body.newMembers;
  let memberIds = [];

  for (const member of newMembers) {
    memberIds.push({ user: member.contactId });
  }

  try {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: {
        participants: memberIds
      } },
      { new: true }
    ).populate('participants.user');

    if (!group) {
      return res.status(422).send({ error: 'Could not add group members' });
    }

    let addedGroupMemberMessage;

    for (const member of newMembers) {
      addedGroupMemberMessage = new GroupMessage({
        group: groupId,
        from: 'admin',
        message: {
          text: `${username} added ${member.contactName} to the group`,
          created: Date.now()
        }
      });
      await addedGroupMemberMessage.save();
    }

    const adminMessage = {
      _id: addedGroupMemberMessage._id,
      text: addedGroupMemberMessage.message.text,
      createdAt:  addedGroupMemberMessage.message.created,
      user: {
        _id: 1,
        name: 'admin'
      }
    };
  
    res.status(200).send({ group, adminMessage });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not add group members' });
  }
});

module.exports = router;