require('./src/models/User');
require('./src/models/PrivateChat');
require('./src/models/PrivateMessage');
require('./src/models/Group');
require('./src/models/GroupMessage');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const serveIndex = require('serve-index');

const User = mongoose.model('User');
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const contactsRoutes = require('./src/routes/contactsRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const groupsRoutes = require('./src/routes/groupsRoutes');
const messageHandler = require('./src/handlers/message.handler');

const app = express();

const server = http.createServer(app);
const io = require('socket.io').listen(server);
require('./src/socket/chat')(io);

app.use(bodyParser.json());
// app.use(express.static(path.resolve(__dirname, '/public/uploads')));

app.use('/public/uploads/', express.static('public/uploads'), serveIndex('public/uploads', {'icons': true}));

app.use(authRoutes);
app.use(chatRoutes);
app.use(contactsRoutes);
app.use(profileRoutes);
app.use(groupsRoutes);

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

server.listen(() => {
  console.log(`Server running`);
});
