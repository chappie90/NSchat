const express = require('express');
const io = require('socket.io')();
const messageHandler = require('./src/handlers/message.handler');

const app = express();

app.get('/', (req, res) => {
  res.send('Hi there');
});

let currentUserId = 2;
const users = {};

io.on('connection', socket => {
  console.log('A user connected');
  console.log(socket.id);
  users[socket.id] = { userId: currentUserId++ };
  socket.on('join', username => {
    users[socket.id].username = username;
    messageHandler.handleMessage(socket, users);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

io.listen(3001, () => {
  console.log('Socket listening on port 3001');
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});