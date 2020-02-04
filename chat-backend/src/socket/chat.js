const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');

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
      return res.status(422).send({ error: 'Something went wrong with your request' });
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

  socket.on('message', async msgObj => {
    console.log(msgObj);
    const { from, to, message: [{ text, createdAt, _id }] } = msgObj;
    try {
      const message = new Message({
        between: [from, to],
        from,
        to,
        message: {
          id: _id,
          text,
          createdAt
        }
      });
      await message.save();

      let recipientSocketId;
      if (users[to]) {
        recipientSocketId = users[to].id;
      }
     
      const returnMsg = 
        {
          _id: message.message.id,
          text,
          createdAt,
          user: {
            _id: 2,
            name: from
          },
          read: false
        };

      io.to(recipientSocketId).emit('message', returnMsg);
      io.to(socketId).emit('message', returnMsg);

    // messageHandler.handleMessage(socket, users); 

      const contactRecipient = await User.find({
        username: to, 
        'contacts.username': from
      });
      
      if (contactRecipient.length == 0) {
        const newContact = await User.findOneAndUpdate(
          { username: to },
          { $addToSet: {
              contacts: {
                username: from,
                previousChat: 1
              }
            }
          },
          { new: true }
        );
      }

      const myChat = await User.updateOne(
        { username: from, 'contacts.username': to }, 
        { $set: { 'contacts.$.previousChat': 1 } },
        { new: true }
      );

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