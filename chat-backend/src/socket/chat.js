const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
const users = {};

module.exports = function(io) {

  io.on('connection', socket => {
  console.log('A user connected');

  const user = socket.handshake.query.username;
  const socketId = socket.id;
  users[user] = socketId;

  socket.on('message', async msgObj => {
    const { from, to, message: [{ text, createdAt }] } = msgObj;
    try {
      const message = new Message({
        between: [from, to],
        from,
        to,
        message: {
          text,
          createdAt
        }
      });
      await message.save();

      const recipientSocketId = users[to];

      const returnMsg = 
        {
          _id: message._id,
          text,
          createdAt,
          user: {
            _id: 2,
            name: from
          }
        };

      io.to(recipientSocketId).emit('message', returnMsg);

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
    // delete users[socket.id];
  });
});
}