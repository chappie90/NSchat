const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Expo } = require('expo-server-sdk');
const axios = require('axios');

const User = mongoose.model('User');
const PrivateMessage = mongoose.model('PrivateMessage');
const Group = mongoose.model('Group');
const GroupMessage = mongoose.model('GroupMessage');
const PrivateChat = mongoose.model('PrivateChat');
const checkAuth = require('../middlewares/checkAuth');
const setCloudinaryTransformUrl = require('../helpers/setCloudinaryTransformUrl');

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dycqqk3s6/upload';

const router = express.Router();
const expo = new Expo();

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

router.post('/chats', checkAuth, async (req, res, next) => {
  try {

    const { username } = req.body;
    const user = await User.find({ username })
      // .populate('contacts.user')
      .populate('groups.group')
      .populate('privateChats.privateChat'); 
    // const contacts = user[0].contacts.filter(c => c.previousChat == true);

    const privateChats = user[0].privateChats;

    const chats = [];
    let unreadMessageCount;

    for (let p of privateChats) {
      const lastprivateChatMessage = await PrivateMessage.find(
        { privateChat: p.privateChat._id }
      )
      .sort({ 'message.createdAt': -1 })
      .limit(1);

      let contact = p.privateChat.participants.filter(c => c != username);

      const contactProfile = await User.find({
        username: contact[0]
      });

      unreadMessageCount = await PrivateMessage.find(
        { 
          between: { $all: [username, contactProfile[0].username] },
          to: username,
          read: false 
        }
      ).count();

      chats.push({
        text: lastprivateChatMessage[0].message.text,
        date: lastprivateChatMessage[0].message.createdAt,
        type: p.privateChat.type,
        contact: contactProfile[0].username,
        profile: {
          imgPath: contactProfile[0].profile.cloudinaryImgPath_200,
          // imgName: contactProfile[0].profile.imgName
        },
        chatId: p.privateChat._id, 
        muted: p.muted,
        from: lastprivateChatMessage[0].from,
        unreadMessageCount
      });
    }

    // for (let c of contacts) {
    //   const lastMessage = await PrivateMessage.find(
    //     { between: { $all: [username, c.user.username] } },
    //     { 'message.text': 1, 'message.createdAt': 1, _id: 0 }
    //   )
    //   .sort({ 'message.createdAt': -1 })
    //   .limit(1);

    //   chats.push({ 
    //     type: 'private',
    //     text: lastMessage[0].message.text, 
    //     date: lastMessage[0].message.createdAt, 
    //     contact: c.user.username, 
    //     profile: c.user.profile,
    //     chatId: 
    //     unreadMessageCount });
    // }

    const groups = user[0].groups;

    for (let g of groups) {
      const lastGroupMessage = await GroupMessage.find(
        { group: g.group._id }
      )
      .sort({ 'message.created': -1 })
      .limit(1);

      const group = await Group.find({ _id: g.group._id })
        .populate('participants.user');

      if (!group) {
        return res.status(422).send({ error: 'Could not fetch chats' }); 
      }

      chats.push({
        text: lastGroupMessage[0].message.text,
        date: lastGroupMessage[0].message.created,
        type: g.group.type,
        contact: g.group.name,
        profile: {
          imgPath: g.group.avatar.cloudinaryImgPath_200,
          // imgName: g.group.avatar.imageName
        },
        groupOwner: g.group.owner,
        chatId: g.group._id,
        muted: g.muted,
        from: lastGroupMessage[0].from,
        unreadMessageCount: 0,
        avatar: {
          imagePath: g.group.avatar.imagePath
        },
        participants: group[0].participants,
        name: g.group.name
      });
    }

    if (!chats) {
      return res.status(422).send({ error: 'Could not fetch chats' });
    }

    res.send({ chats });
  } catch (err) {
    next(err);
    return res.status(422).send({ error: 'Could not fetch chats' });
  }

});

 // formPost(url, form) {
 //    return new Promise((resolve, reject) => {
 //      console.log(form.getHeaders()['content-type']);
 //      axios({
 //        method: 'post',
 //        url,
 //        data: form,
 //        headers: { 'Content-Type': form.getHeaders()['content-type'] },
 //        cancelToken: new CancelToken((c) => {
 //          cancel = c;
 //        }),
 //      }).then((res) => {
 //        resolve(res);
 //      }).catch((err) => {
 //        console.log(err);
 //        reject(err);
 //      });
 //    });
 //  },

router.post('/messages', checkAuth, async (req, res, next) => {

  try {
    const { chatType, chatId, username, recipient, page } = req.body;

    const skip = 1000 * (page - 1);
    let messages;

    if (chatType === 'private') {
      messages = await PrivateMessage.find({ between: { $all: [username, recipient] } })
                                     .skip(skip)
                                     .sort({ 'message.createdAt': -1 })
                                     .limit(1000);
    }

    if (chatType === 'group') {
      messages = await GroupMessage.find({ group: chatId })
                                   .skip(skip)
                                   .sort({ 'message.created': -1 })
                                   .limit(1000);
    }

    res.status(200).send({ messages });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not fetch messages' });
  }
});

router.patch('/messages/clear', checkAuth, async (req, res) => {
  const { username, recipient } = req.body;
  try {
    const messages = await PrivateMessage.update(
      { between: { $all: [username, recipient] }, to: username, read: false },
      { $set: { read: true } },
      { multi: true }
    );
    
    let response = messages.nModified > 0 ? true : false;

    res.status(200).send({ response });
  } catch (err) {
    next(err);
    return res.status(422).send({ error: 'Could not clear messages' });
  }
});


// this is only for private chats, need to update for groups
// router.patch('/message/read', checkAuth, async (req, res) => {
//   const { username, recipient } = req.body;
//   try {

//     const test = await PrivateMessage.find( { between: { $all: [username, recipient] }, read: false });

//     console.log(test);

//     const messages = await PrivateMessage.update(
//       { between: { $all: [username, recipient] }, from: recipient, read: false },
//       { $set: { read: true } },
//       { multi: true }
//     );

//     // console.log(messages);

//     let response = messages.nModified > 0 ? true : false;

//     console.log(response)
//     res.status(200).send({ response });
//   } catch (err) {
//     console.log(err);
//     return res.status(422).send({ error: 'Could not mark messages as read' });
//   }
// });

router.patch('/message/delete', checkAuth, async (req, res, next) => {
  
  try {
    const { messageId } = req.body;

    const message = await PrivateMessage.update(
      { 'message.id': messageId },
      { $set: { 'message.text': 'Message deleted', deleted: true } },
      { new: true }
    );

    let response = message.nModified > 0 ? true : false;

    res.status(200).send({ response });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not delete message' });
  }
});

router.patch('/chat/delete', checkAuth, async (req, res) => {
  const { username, chatId, type } = req.body;
  let chat;
  try {

    if (type === 'group') {
      chat = await User.update(
        { username: username },
        { $pull: { groups: { group: chatId } } }
      );
    } else if (type === 'private') {
      chat = await User.update(
        { username: username },
        { $pull: {
          privateChats: {
            privateChat: chatId
          }
        } }
      );
    }

    let response = chat.nModified > 0 ? true : false;
    
    res.status(200).send({ response });
  } catch (err) {
    next(err);
    res.status(422).send({ error: 'Could not delete chat' });
  }
});

router.patch('/chat/mute', checkAuth, async (req, res) => {
  const { username, chatId, type, currentValue } = req.body;
  let mutedChat;

  try {
    if (type === 'group') {
      mutedChat = await User.update(
        { username: username, 'groups.group': chatId },
        { $set: {
          'groups.$.muted': !currentValue
        } }
      );
    } else if (type === 'private') {
      mutedChat = await User.update(
        { username: username, 'privateChats.privateChat': chatId },
        { $set: {
          'privateChats.$.muted': !currentValue
        } }
      );
    }

    let response = mutedChat.nModified > 0 ? true : false;

    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not mute chat' });
  }
});

router.post(
  '/group/new', 
  checkAuth,
  multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).single('group'),
  async (req, res) => {
    const username = req.body.username;
    const groupName = req.body.groupName;
    let groupMembers = req.body.groupMembers;
    groupMembers = JSON.parse(groupMembers);

    let expoPushTokens = [];
    let notifications = [];
    
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
          return res.status(422).send({ error: 'Could not save image' });
        }

        let urlParts = response.data.url.split('/');
        urlParts.splice(-2, 1);
        cloudinaryUrl = urlParts.join('/');
      }

      let participantsArr = [];
      for (let member of groupMembers) {
        let memberId = await User.find({ username: member });
        participantsArr.push({ user: memberId[0]._id });
        if (member !== username) {
          expoPushTokens.push(memberId[0].expoToken);
        }        
      }

      // $push and $addToSet don't work with inserts only with updates
      const group = new Group({
        name: groupName,
        owner: username,
        participants: participantsArr,
        avatar: {
          imagePath: imgPath ? imgPath : null,
          imageName: req.file ? req.file.filename : '',
          cloudinaryImgPath_150: cloudinaryUrl ? setCloudinaryTransformUrl(cloudinaryUrl, 150) : null,
          cloudinaryImgPath_200: cloudinaryUrl ? setCloudinaryTransformUrl(cloudinaryUrl, 200) : null,
          cloudinaryImgPath_400: cloudinaryUrl ? setCloudinaryTransformUrl(cloudinaryUrl, 400) : null
        }
      });
      await group.save();

      let newMembers = [];

      for (const member of groupMembers) {
        newMembers.push(await User.findOneAndUpdate(
          { username: member },
          { $addToSet: {
            groups: {
              group: group._id
            }
          } },
          { new: true }
        ));  
      }

      const initialGroupMessage = new GroupMessage({
        group: group._id,
        from: 'admin',
        message: {
          text: `${username} created group "${groupName}"`,
          created: Date.now()
        }
      });
      await initialGroupMessage.save();

      const createdGroup = await Group.find({ _id: group._id }).populate('participants.user');

      const newGroup = {
        chatId: group._id,
        type: 'group',
        text: initialGroupMessage.message.text,
        date: initialGroupMessage.message.created,
        contact: groupName,
        profile: {
          imgPath: group.avatar.cloudinaryImgPath_200 ? group.avatar.cloudinaryImgPath_200 : null,
          imgName: req.file ? req.file.filename : ''
        },
        groupOwner: username,
        unreadMessageCount: 0,
        avatar: {
          imagePath: group.avatar.imagePath
        },
        participants: createdGroup[0].participants,
        name: group.name
      };

      for (let token of expoPushTokens) {
          if (!Expo.isExpoPushToken(token)) {
            console.log(`Push token ${token} is not a valid Expo push token`);
          }

          notifications.push({
            to: token,
            sound: 'default',
            title: username,
            ttl: 2419200,
            body: 'You were added to a group',
            data: {
              sender: group.name,
              message: `${username} added you to a group`,
              img: group.avatar.cloudinaryImgPath_200,
              type: 'group',
              chatId: group._id
            }
          });

          let chunks = expo.chunkPushNotifications(notifications);

          (async () => {
            for (let chunk of chunks) {
              try {
                let receipts = await expo.sendPushNotificationsAsync(chunk);
              } catch (error) {
                console.log(error);
              }
            }
          })();
      }

      res.status(200).send({ newGroup });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not create group' });
    }
  }
);

router.post('/expo/token', checkAuth, async (req, res) => {
  const username = req.body.username;
  const expoToken = req.body.expoToken;

  try {
    const user = await User.findOneAndUpdate(
      { username: username },
      { expoToken },
      { new: true }
    );

    if (!user) {
      return  res.status(422).send({ error: 'Something went wrong with your request' });
    }

    res.status(200).send({ expoToken });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not save expo token' });
  }
});


router.post('/badge/clear', checkAuth, async (req, res) => {
  const username = req.body.username;

  try {
    const user = await User.updateOne(
      { username: username },
      { badgeCount: 0 },
    );

    if (!user) {
      return  res.status(422).send({ error: 'Something went wrong with your request' });
    }

    res.status(200).send({ message: 'Badge count reset' });
  } catch (err) {
    console.log(err);
    res.status(422).send({ error: 'Could not reset badge count' });
  }
});

router.post(
  '/message/image/save', 
  checkAuth,
  multer({ storage: storage, limits: { fieldSize: 25 * 1024 * 1024 } }).single('imageMessage'),
  async (req, res) => {

  try {
    if (!req.file) {
      return res.status(422).send({ error: 'Could not save image' });
    }

    const url = req.protocol + '://' + req.get('host');
    let imgName = req.file.filename;
    let imgPath = url + '/public/uploads/' + req.file.filename;

    res.status(200).send({ imgPath, imgName });
  } catch (err) {
    console.log(err)
    res.status(422).send({ error: 'Could not save image' });
  }
});

module.exports = router;