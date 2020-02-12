const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

const checkAuth = require('../middlewares/checkAuth');

const router = express.Router();

router.post('/chats', checkAuth, async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.find({ username }).populate('contacts.user'); 
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

// router.post('/speech', async (req, res) => {
//   console.log(req.body);

//   try {
  
//   } catch (err) {
//     console.log(err);
//     return res.status(422).send({ error: 'Could not fetch messages' });
//   }
// });

module.exports = router;