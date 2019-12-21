const express = require('express');
const io = require('socket.io')();
const messageHandler = require('./src/handlers/message.handler');

const app = express();

app.get('/', (req, res) => {
  res.send('Hi there');
});

let currentUserId = 2;
const users = {};

function createUserAvatarUrl() {
  const rand1 = Math.round(Math.random() * 200 + 100);
  const rand2 = Math.round(Math.random() * 200 + 100);
  return `https://placeimg.com/${rand1}/${rand2}/any`;
}

io.on('connection', socket => {
  console.log('A user connected');
  console.log(socket.id);
  users[socket.id] = { userId: currentUserId++ };
  socket.on('join', username => {
    users[socket.id].username = username;
    users[socket.id].avatar = createUserAvatarUrl();
    messageHandler.handleMessage(socket, users);
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