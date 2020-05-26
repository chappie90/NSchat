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
        const user = await User.findOne({ username }).populate('contacts.user');

        if (!user) {
          return;
          // ? exit socket ?
          // return res.status(422).send({ error: 'Something went wrong with your request' });
        }
        const contacts = user.contacts.map(c => c.user.username);

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
     
        // Get the clients in a room
        io.in(username).clients((err , clients) => {
          // console.log(clients);
      });
      // need to send yourself array of online contacts and
      // send all clients in the room your name so they can add update their state and add you in their array
      // send to everyone in the room including the sender
      //io.sockets.in(username).emit('online', onlineContacts);
      // send to everyone in the room except the sender
      let onlineUser = [username];
      socket.broadcast.to(username).emit('online', onlineUser);
      // send to sender only
      io.to(socketId).emit('online', onlineContacts);
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
        io.to(users[data.recipient].id).emit('has_joined_chat', { user: data.username, messageId: data.messageId });
      }
    });

    socket.on('new_group', data => {
      for (let member of data.groupMembers) {
        if (users[member]) {
          io.to(users[member].id).emit('new_group');
        }
      }
    });

    socket.on('group_image_updated', async (data) => {
        const groupParticipants = data.group.participants;
        const activeGroupParticipants = [];

        for (let p of groupParticipants) {
          if (p.user.username !== data.editor && users[p.user.username]) {
            activeGroupParticipants.push(users[p.user.username].id);
          }
        }

        for (let p of activeGroupParticipants) {
          io.to(p).emit('group_image_updated', {
            editor: data.editor, 
            group: data.group, 
            adminMessage: data.adminMessage 
          });
        }
    });

    socket.on('group_members_added', async (data) => {
        const groupParticipants = data.group.participants;
        const activeGroupParticipants = [];

        for (let p of groupParticipants) {
          if (p.user.username !== data.editor && users[p.user.username]) {
            activeGroupParticipants.push(users[p.user.username].id);
          }
        }

        for (let p of activeGroupParticipants) {
          io.to(p).emit('group_members_added', {
            editor: data.editor, 
            group: data.group, 
            adminMessage: data.adminMessage 
          });
        }
    });


    socket.on('update_group_name', async (data) => {
      const groupId = data.id;
      const groupName = data.name;
      const editor = data.username;

      try {
        const group = await Group.findOneAndUpdate(
          { _id: groupId },
          { name: groupName },
          { new: true }
        ).populate('participants.user');

        if (!group) {
          return res.status(422).send({ error: 'Could not update group name' });
        }

        const updatedGroupNameMessage = new GroupMessage({
          group: groupId,
          from: 'admin',
          message: {
            text: `${username} changed group name to '${groupName}'`,
            created: Date.now()
          }
        });
        await updatedGroupNameMessage.save();

        const adminMessage = {
          _id: updatedGroupNameMessage._id,
          text: updatedGroupNameMessage.message.text,
          createdAt:  updatedGroupNameMessage.message.created,
          user: {
            _id: 1,
            name: 'admin'
          }
        };

        const groupParticipants = group.participants;
        const activeGroupParticipants = [];

        for (let p of groupParticipants) {
          if (p.user.username !== editor && users[p.user.username]) {
            activeGroupParticipants.push(users[p.user.username].id);
          }
        }

        for (let p of activeGroupParticipants) {
          io.to(p).emit('group_name_updated', { editor, group, adminMessage });
        }
        io.to(socketId).emit('group_name_updated', { editor, group, adminMessage });
        // res.status(200).send({ group, adminMessage });
      } catch (err) {
        console.log(err);
        // send error with emit instead
        // res.status(422).send({ error: 'Could not update group name' });
      } 
    });

    socket.on('message', async msgObj => {

      const {
        type,
        chatId,
        from, 
        to, 
        message: [{ text, createdAt, _id, imgPath, imgName }],
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
          },
          image: {
            imgPath: imgPath ? imgPath : null,
            imgName: imgName ? imgName : ''
          }
        });

        await groupMessage.save();

        const group = await Group.find({ _id: chatId }).populate('participants.user');

        const groupParticipants = group[0].participants;
        const activeGroupParticipants = [];

        for (let p of groupParticipants) {
          if (p.user.username !== from && users[p.user.username]) {
            activeGroupParticipants.push(users[p.user.username].id);

            const badgeCount = p.user.badgeCount + 1;

            if (!Expo.isExpoPushToken(p.user.expoToken)) {
              console.log(`Push token ${p.user.expoToken} is not a valid Expo push token`);
            }

            const checkIfMuted = p.user.groups.filter(item => item.group == chatId);

            if (checkIfMuted.length > 0 && !checkIfMuted[0].muted) {

              notifications.push({
                to: p.user.expoToken,
                sound: 'default',
                title: from,
                ttl: 2419200,
                badge: badgeCount,
                body: text ? `${from}: ${text}` : `${from} sent a photo`,
                data: {
                 sender: group[0].name,
                 message: text ? `${from}: ${text}` : `${from} sent a photo`,
                 img: group[0].avatar.cloudinaryImgPath_150,
                 type: type,
                 chatId: chatId 
               },
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
            replyAuthor: messageAuthor,
            image: imgPath ? imgPath : '',
          };

          const updatePreviousChatsRecipient = {
            chatId,
            contact: from,
            date: createdAt,
            text,
            from
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
            replyAuthor: messageAuthor,
            image: imgPath ? imgPath : '',
          };

        const updatePreviousChatsUser = {
          chatId,
          contact: to,
          date: createdAt,
          text,
          from
        };

        for (let p of activeGroupParticipants) {
          io.to(p).emit('message', { message: returnGroupMsgRecipient, chat: updatePreviousChatsRecipient });
        }
        io.to(socketId).emit('message', { message: returnGroupMsgUser, chat: updatePreviousChatsUser });

      }
      
      if (type === 'private') {

        const tempUserId = await User.find({ username: from });
        const tempUserId2 = await User.find({ username: to });

        const updateBadge = await User.updateOne(
          { username: to }, 
          { $inc: { badgeCount: 1 } },
          { new: true }
        );

        const badgeCount = tempUserId2[0].badgeCount + 1;
        const senderImage = tempUserId[0].profile.cloudinaryImgPath_200;
        const recipientImage = tempUserId2[0].profile.cloudinaryImgPath_200;

        expoPushTokens.push(tempUserId2[0].expoToken);

        let privateChatId, newContact;

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

        const contactRecipient = await User.find({
          username: to, 
          'contacts.user': tempUserId[0]._id
        });

        if (contactRecipient.length === 0) {

        newContact = await User.findOneAndUpdate(
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
          },
          image: {
            imgPath: imgPath ? imgPath : null,
            imgName: imgName ? imgName : ''
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
            replyAuthor: messageAuthor,
            image: imgPath ? imgPath : '',
          };

        const updatePreviousChatsRecipient = {
          chatId: privateChatId,
          contact: from,
          date: createdAt,
          text, 
          profile: {
            imgPath: senderImage
          } 
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
            replyAuthor: messageAuthor,
            image: imgPath ? imgPath : '',
          };

        const updatePreviousChatsUser = {
          chatId: privateChatId,
          contact: to,
          date: createdAt,
          text,
          profile: {
            imgPath: recipientImage
          } 
        };

        io.to(recipientSocketId).emit('message', { message: returnMsgRecipient, chat: updatePreviousChatsRecipient });
        io.to(socketId).emit('message', { message: returnMsgUser, chat: updatePreviousChatsUser });

        if (!Expo.isExpoPushToken(expoPushTokens[0])) {
          console.log(`Push token ${pushToken} is not a valid Expo push token`);
        }

        let checkIfMuted;
        if (newContact) {
          checkIfMuted = newContact.privateChats.filter(item => item.privateChat == chatId);
        } else {
          checkIfMuted = tempUserId2[0].privateChats.filter(item => item.privateChat == chatId);
        }
        if (checkIfMuted.length > 0 && !checkIfMuted[0].muted) {
          notifications.push({
            to: expoPushTokens[0],
            sound: 'default',
            title: from,
            ttl: 2419200,
            badge: badgeCount,
            body: text ? text : `${from} sent a photo`,
            data: {
              sender: from, 
              message: text ? text : `${from} sent a photo`,
              img: tempUserId2[0].profile.cloudinaryImgPath_150, 
              type: type, 
              chatId: chatId 
            }
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

      } catch(err) {
        console.log(err);
      }
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected');
      // console.log(io.sockets.adapter.rooms);
      const user = await User.findOne({ username }).populate('contacts.user');

      if (!user) {
        return;
        // ? exit socket ?
        // return res.status(422).send({ error: 'Something went wrong with your request' });
      }
      const contacts = user.contacts.map(c => c.user.username);

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

      socket.broadcast.to(username).emit('offline', username);
      io.of('/').in(username).clients((error, socketIds) => {
        if (error) throw error;
        socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(username));
      });
      delete users[username];
    });
  });
}