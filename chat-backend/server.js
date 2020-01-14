require('./src/models/User');
require('./src/models/Message');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const io = require('socket.io')();
const { Expo } = require('expo-server-sdk') ;

const Message = mongoose.model('Message');
const User = mongoose.model('User');
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const messageHandler = require('./src/handlers/message.handler');

const app = express();
const expo = new Expo();

app.use(bodyParser.json());
app.use(authRoutes);
app.use(chatRoutes);

const mongoUri = 'mongodb+srv://stoyangarov:Daspak12@emaily-w8ewa.mongodb.net/ns-chat?retryWrites=true&w=majority';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});

mongoose.connection.on('error', (err) => {
  console.log('Erro connection to mongo', err);
});

app.get('/', (req, res) => {
  res.send('Hi there');
});

const users = {};
const savedPushTokens = [];

const saveToken = (token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
}

const handlePushTokens = (message) => {
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'Message received!',
      body: message,
      data: { message }
    });
  }

  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.log(error);
      }
    }
  })();
};

app.post('/token', (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

app.post('/message', (req, res) => {
   handlePushTokens(req.body.message);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
}); 

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

io.listen(3001, () => {
  console.log('Socket listening on port 3001');
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});