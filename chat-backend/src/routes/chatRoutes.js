const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const User = mongoose.model('User');
const Message = mongoose.model('Message');
const Group = mongoose.model('Group');
const GroupMessage = mongoose.model('GroupMessage');
const checkAuth = require('../middlewares/checkAuth');

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

router.post('/chats', checkAuth, async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.find({ username })
      .populate('contacts.user')
      .populate('groups.group'); 
    const contacts = user[0].contacts.filter(c => c.previousChat == true);

    const chats = [];
    let unreadMessageCount;

    for (let c of contacts) {
      const lastMessage = await Message.find(
        { between: { $all: [username, c.user.username] } },
        { 'message.text': 1, 'message.createdAt': 1, _id: 0 }
      )
      .sort({ 'message.createdAt': -1 })
      .limit(1);

      unreadMessageCount = await Message.find(
        { 
          between: { $all: [username, c.user.username] },
          to: username,
          read: false 
        }
      ).count();

      chats.push({ 
        text: lastMessage[0].message.text, 
        date: lastMessage[0].message.createdAt, 
        contact: c.user.username, 
        profile: c.user.profile,
        unreadMessageCount });
    }

    const groups = user[0].groups;

    for (let g of groups) {
      const lastGroupMessage = await GroupMessage.find(
        { group: g.group._id }
      )
      .sort({ 'message.created': -1 })
      .limit(1);

      chats.push({
        text: lastGroupMessage[0].message.text,
        date: lastGroupMessage[0].message.created,
        contact: g.group.name,
        profile: {
          imgPath: g.group.avatar.imagePath,
          imgName: g.group.avatar.imageName
        },
        groupOwner: g.group.owner,
        unreadMessageCount: 0
      });
    }

    console.log(chats);

    res.send({ chats });
  } catch (err) {
    return res.status(422).send(err.message);
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

router.post('/messages', checkAuth, async (req, res) => {
  const { username, recipient, page } = req.body;

  const skip = 50 * (page - 1);

  try {
    const messages = await Message.find({ between: { $all: [username, recipient] } }, { from: 1, to: 1, message: 1, read: 1, deleted: 1, replyTo: 1 })
                                  .skip(skip)
                                  .sort({ 'message.createdAt': -1 })
                                  .limit(50);

    console.log(messages);

    res.status(200).send({ messages });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: 'Could not fetch messages' });
  }
});

router.patch('/messages/clear', checkAuth, async (req, res) => {
  const { username, recipient } = req.body;
  try {
    const messages = await Message.update(
      { between: { $all: [username, recipient] }, to: username, read: false },
      { $set: { read: true } },
      { multi: true }
    );
    
    let response = messages.nModified > 0 ? true : false;

    res.status(200).send({ response });
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: 'Could not clear messages' });
  }
});

router.patch('/message/delete', checkAuth, async (req, res) => {
  const { messageId } = req.body;
  try {
    const message = await Message.update(
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

router.post(
  '/group/new', 
  checkAuth,
  multer({ storage: storage }).single('group'),
  async (req, res) => {
    const username = req.body.username;
    const groupName = req.body.groupName;
    let groupMembers = req.body.groupMembers;
    groupMembers = JSON.parse(groupMembers);
    const url = req.protocol + '://' + req.get('host');
    const imgPath = url + '/public/uploads/' + req.file.filename;

    try {
      const group = new Group({
        name: groupName,
        owner: username,
        members: groupMembers,
        avatar: {
          imagePath: imgPath,
          imageName: req.file.filename
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
        from: username,
        message: {
          text: `${username} created group "${groupName}"`,
          created: Date.now()
        }
      });

      await initialGroupMessage.save();

      console.log(initialGroupMessage);
      
      res.status(200).send({ group });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: 'Could not create group' });
    }
  }
);

module.exports = router;