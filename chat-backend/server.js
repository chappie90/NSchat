require('./src/models/User');
require('./src/models/Message');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const { Expo } = require('expo-server-sdk');

const User = mongoose.model('User');
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const contactsRoutes = require('./src/routes/contactsRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const messageHandler = require('./src/handlers/message.handler');

const app = express();

const server = http.createServer(app);
const io = require('socket.io').listen(server);
require('./src/socket/chat')(io);

const expo = new Expo();

app.use(bodyParser.json());
app.use(authRoutes);
app.use(chatRoutes);
app.use(contactsRoutes);
app.use(profileRoutes);

// import { resolve } from  'path';
// const Port = process.env.PORT || 3000;

//app.use(express.static(resolve(__dirname, './uploads')))

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
  saveToken(req.body.token);
  console.log(`Received push token, ${req.body.token}`);
  res.send(`Received push token, ${req.body.token}`);
});

app.post('/message', (req, res) => {
  console.log(req.body.message);
   handlePushTokens(req.body.message);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
}); 

server.listen(3000, () => {
  console.log('Listening on port 3000');
});