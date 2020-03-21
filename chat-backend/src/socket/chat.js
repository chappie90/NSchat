const mongoose = require('mongoose');
const User = mongoose.model('User');
const PrivateMessage = mongoose.model('PrivateMessage');
const PrivateChat = mongoose.model('PrivateChat');
const GroupMessage = mongoose.model('GroupMessage');

const users = {};
let onlineContacts = [];

module.exports = function(io) {

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
          // console.log(key);
          // console.log(value.id);
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

  socket.on('delete_message', async (msg) => {

    try {
      const message = await PrivateMessage.update(
        { 'message.id': msg._id },
        { $set: { 'message.text': 'Message deleted', deleted: true } },
        { new: true }
      );

    let response = message.nModified > 0 ? msg : false;

    io.to(socketId).emit('message_deleted', response);
  } catch (err) {
    console.log(err);
  }
  });

  socket.on('join_chat', data => {
    if (users[data.recipient]) {
      console.log(data.recipient);
      console.log(data.username);
      io.to(users[data.recipient].id).emit('has_joined_chat', data.username);
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
    }

    if (type === 'private') {
      const tempUserId = await User.find({ username: from });
      const tempUserId2 = await User.find({ username: to });

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