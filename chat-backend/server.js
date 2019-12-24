require('./src/models/User');
require('./src/models/Message');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const io = require('socket.io')();

const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const messageHandler = require('./src/handlers/message.handler');

const app = express();

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

let currentUserId = 2;
const users = {};

io.on('connection', socket => {
  console.log('A user connected');
  // users[socket.id] = { userId: currentUserId++ };
  socket.on('message', message => {
     // console.log(socket.id);
     console.log(message);
    socket.emit('message', message);
    // users[socket.id].username = username;
    // users[socket.id].avatar = createUserAvatarUrl();
    // messageHandler.handleMessage(socket, users);
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