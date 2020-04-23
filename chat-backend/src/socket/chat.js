const mongoose = require('mongoose');
const { Expo } = require('expo-server-sdk');
const User = mongoose.model('User');
const PrivateMessage = mongoose.model('PrivateMessage');
const PrivateChat = mongoose.model('PrivateChat');
const GroupMessage = mongoose.model('GroupMessage');
const Group = mongoose.model('Group');

const users = {};
let onlineContacts = [];

module.exports = function(io) {
  const expo = new Expo();

  io.on('connection', async socket => {
  console.log('A user connected');

  const username = socket.handshake.query.username;
  const socketId = socket.id;

  // To have a client join a room you need to get the clients obejct (socket)
  // Could have everyone join an 'All' room instead of using users object?
  users[username] = socket;
  // every socket is automatically connected to their own room with the id socket.id 
  // but we are creating our own to have more control
  socket.join(username);
  // show list of all rooms
  // console.log(io.sockets.adapter.rooms);
  try {
    const user = await User.findOne({ username }, { 'contacts.username': 1, _id: 0 });
    if (!user) {
      return;
      // ? exit socket ?
      // return res.status(422).send({ error: 'Something went wrong with your request' });
    }
    const contacts = user.contacts.map(c => c.username);
    // console.log(username);
    // console.log(socketId);
    // console.log(contacts);
    // console.log(`${onlineContacts} before`);
    for (const c of contacts) {
      for (let [key, value] of Object.entries(users)) {
        if (c === key) {
          if (!onlineContacts.includes(key)) {
            onlineContacts.push(key);
          }
          users[key].join(username); 
        } else {
          onlineContacts = onlineContacts.filter(item => item !== key);
        }
      }
    }
    // console.log(`${onlineContacts} after`);
    // Get the clients in a room
    io.in(username).clients((err , clients) => {
      console.log(clients);
    });
    // need to send yourself array of online contacts and
    // send all clients in the room your name so they can add update their state and add you in their array
    // send to everyone in the room including the sender
    //io.sockets.in(username).emit('online', onlineContacts);
    // send to everyone in the room except the sender
    socket.broadcast.to(username).emit('online', username);
    // send to sender only
    // socket.emit('online', onlineContacts);
    const clientsStr = JSON.stringify(onlineContacts);
    socket.emit('online', clientsStr);
  } catch (err) {
    console.log(err);
    return res.status(422).send({ error: 'Something went wrong with your request' });
  }

  socket.on('start_typing', data => {
    if (users[data.recipient]) {
      io.to(users[data.recipient].id).emit('is_typing', data.username);
    }
  });

  socket.on('stop_typing', recipient => {
    if (users[recipient]){
      io.to(users[recipient].id).emit('is_not_typing');
    }
  });

  socket.on('delete_message', async (data) => {
    if (users[data.recipient]){
      io.to(users[data.recipient].id).emit('message_deleted', data);
    }
  });

  socket.on('join_chat', data => {
    if (users[data.recipient]) {
      io.to(users[data.recipient].id).emit('has_joined_chat', data.username);
    }
  });

  socket.on('new_group', data => {
    for (let member of data.groupMembers) {
      if (users[member]) {
        io.to(users[member].id).emit('new_group');
      }
    }
  });

  socket.on('message', async msgObj => {
    const {
      type,
      chatId,
      from, 
      to, 
      message: [{ text, createdAt, _id }],
      replyTo: { messageId, messageText, messageAuthor }
    } = msgObj;

    try {

    // messageHandler.handleMessage(socket, users); 

    // TEMPORARY - GET USER IDS AND REDUCE NUMBER OF QUERIES
    let expoPushTokens = [];
    let notifications = [];

    if (type === 'group') {

      const groupMessage = new GroupMessage({
        group: chatId,
        from: from,
        message: {
          giftedChatId: _id,
          text,
          created: createdAt
        },
        replyTo: {
          originalMsgId: messageId,
          originalMsgText: messageText,
          originalMsgAuthor: messageAuthor
        }
      });

      await groupMessage.save();

      const group = await Group.find({ _id: chatId }).populate('participants.user');

      const groupParticipants = group[0].participants;
      const activeGroupParticipants = [];

      for (let p of groupParticipants) {
        if (p.user.username !== from && users[p.user.username]) {
          activeGroupParticipants.push(users[p.user.username].id);
          if (!Expo.isExpoPushToken(p.user.expoToken)) {
            console.log(`Push token ${p.user.expoToken} is not a valid Expo push token`);
          }
          notifications.push({
            to: p.user.expoToken,
            sound: 'default',
            title: from,
            body: text,
            data: { text },
            _displayInForeground: true
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
      }
     
      const returnGroupMsgRecipient = 
        {
          _id: groupMessage.message.giftedChatId,
          text,
          createdAt,
          user: {
            _id: 2,
            name: from
          },
          read: false,
          deleted: false,
          reply: messageText,
          replyAuthor: messageAuthor
        };

      const returnGroupMsgUser = 
       {
          _id: groupMessage.message.giftedChatId,
          text,
          createdAt,
          user: {
            _id: 1,
            name: from
          },
          read: false,
          deleted: false,
          reply: messageText,
          replyAuthor: messageAuthor
        };

      for (let p of activeGroupParticipants) {
         io.to(p).emit('message', returnGroupMsgRecipient);
      }
      io.to(socketId).emit('message', returnGroupMsgUser);

    }

    if (type === 'private') {

      const tempUserId = await User.find({ username: from });
      const tempUserId2 = await User.find({ username: to });

      expoPushTokens.push(tempUserId2[0].expoToken);

      const contactRecipient = await User.find({
        username: to, 
        'contacts.user': tempUserId[0]._id
      });

      let privateChatId;

      const checkPrivateChat = await PrivateChat.find({ participants: { $all: [to, from] } });

      if (checkPrivateChat.length === 0) {

        const newPrivateChat = new PrivateChat({
          participants: [from, to]   
        });
        await newPrivateChat.save();

        privateChatId =  newPrivateChat._id;

        const updateFromUserChats = await User.updateOne(
          { username: from }, 
          { $addToSet: {
            privateChats: {
              privateChat: newPrivateChat._id
            } }
          },
          { new: true}
        );
      } else {
        privateChatId = checkPrivateChat[0]._id;

        const isPrivateChat = await User.find({ username: username, 'privateChats.privateChat': chatId });

        if (isPrivateChat.length === 0) {
          const updateFromUserChats = await User.updateOne(
            { username: from }, 
            { $addToSet: {
              privateChats: {
                privateChat: checkPrivateChat[0]._id
              } }
            },
            { new: true}
          );
        }
      }

      if (contactRecipient.length === 0) {

        const newContact = await User.findOneAndUpdate(
          { username: to },
          { $addToSet: {
              contacts: {
                user: tempUserId[0]._id,
                previousChat: true
              },
              privateChats: {
                privateChat: privateChatId
              }
          }},
          { new: true }
        );
      }

      const myChat = await User.updateOne(
        { username: from, 'contacts.user': tempUserId2[0]._id }, 
        { $set: {
            'contacts.$.previousChat': true 
          },
        },
        { new: true }
      );

      const privateMessage = new PrivateMessage({
        privateChat: privateChatId,
        between: [from, to],
        from,
        to,
        message: {
          id: _id,
          text,
          createdAt
        },
        replyTo: {
          messageId,
          messageText,
          messageAuthor
        }
      });
      
      await privateMessage.save();

      let recipientSocketId;
      if (users[to]) {
        recipientSocketId = users[to].id;
      }
     
      const returnMsgRecipient = 
        {
          _id: privateMessage.message.id,
          text,
          createdAt,
          user: {
            _id: 2,
            name: from
          },
          read: false,
          deleted: false,
          reply: messageText,
          replyAuthor: messageAuthor
        };

      const returnMsgUser = 
       {
          _id: privateMessage.message.id,
          text,
          createdAt,
          user: {
            _id: 1,
            name: from
          },
          read: false,
          deleted: false,
          reply: messageText,
          replyAuthor: messageAuthor
        };

      io.to(recipientSocketId).emit('message', returnMsgRecipient);
      io.to(socketId).emit('message', returnMsgUser);

      if (!Expo.isExpoPushToken(expoPushTokens[0])) {
        console.log(`Push token ${pushToken} is not a valid Expo push token`);
      }

      notifications.push({
        to: expoPushTokens[0],
        sound: 'default',
        title: from,
        ttl: 2419200,
        // badge: 10,
        body: text,
        data: { text },
        _displayInForeground: true
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

    } catch(err) {
      console.log(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    socket.broadcast.to(username).emit('offline', username);
    io.of('/').in(username).clients((error, socketIds) => {
      if (error) throw error;
      socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(username));
    });
    delete users[username];
  });
});
}