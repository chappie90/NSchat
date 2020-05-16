import axios from 'axios';
import * as FileSystem from 'expo-file-system';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'get_messages':
      return state.chat[action.payload.chatId] ?
        { ...state, chat: 
          { ...state.chat, 
          [action.payload.chatId]:
            [ ...state.chat[action.payload.chatId], ...action.payload.messages ] } } :
         { ...state, chat: 
          { ...state.chat, 
          [action.payload.chatId]: action.payload.messages } };
    case 'reset_chat_state':
      return { ...state, chat: { [action.payload]: state.chat[action.payload].slice(0, 50) } };
    case 'update_messages':
      return state.chat[action.payload.chatId] ?
       { ...state, chat: {
        ...state.chat, 
          [action.payload.chatId]: 
            [ action.payload.message, ...state.chat[action.payload.chatId] ] } } :
       { ...state, chat: {
        ...state.chat, 
          [action.payload.chatId]: 
            [ action.payload.message ] } };
    case 'load_more_messages':
      return { ...state, chat: [ ...state.chat, ...action.payload ] };
    case 'get_chats':
      return { ...state, previousChats: action.payload };
    case 'add_new_chat':
      return { ...state, previousChats: [ ...state.previousChats, action.payload ] };
    case 'update_chat_state':
      let updatedChat;
      if (action.payload.chat && !state.previousChats.find(chat => chat.chatId === action.payload.chat.chatId)) {
        updatedChat = {
          chatId: action.payload.chat.chatId,
          contact: action.payload.chat.contact,
          date: action.payload.chat.date,
          text: action.payload.chat.text,
          type: 'private',
          muted: false,
          profile: action.payload.chat.profile,
          unreadMessageCount: 1
        };
        return { ...state, previousChats: [ ...state.previousChats, updatedChat ]}; 
      } else {
         if (action.payload.updateUnreadMessageCount) {
        updatedChat = state.previousChats.map(item => {
          return item.chatId === action.payload.chat.chatId ?
            { ...item,
              date: action.payload.chat.date,
              text: action.payload.chat.text,
              unreadMessageCount: item.unreadMessageCount ? item.unreadMessageCount + 1 : 1
            } :
            item
        });
      } else {
        updatedChat = state.previousChats.map(item => {
          return item.chatId === action.payload.chatId ?
            { ...item,
              date: action.payload.date,
              text: action.payload.text 
            } :
            item
        });
      }
      updatedChat = updatedChat.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { ...state, previousChats: updatedChat };
    }
    case 'delete_chat':
      const updatedChats = state.previousChats.filter(item => item.chatId !== action.payload );
      return { ...state, previousChats: updatedChats };
    case 'mute_chat':
      const mutedChat = state.previousChats.map(item => {
        return item.chatId === action.payload.chatId ? { ...item, muted: !action.payload.currentValue } : item;
      });
      return { ...state, previousChats: mutedChat };
    case 'mark_messages_read':
      const markedMessages = state.previousChats.map(item => {
        return item.contact === action.payload ? { ...item, unreadMessageCount: 0 } : item;
      });
      return { ...state, previousChats: markedMessages };
    case 'mark_message_read': 
      // if you have more than initial 50 messages loaded it will jump back to first 50...
      // if (state.chat[action.payload]) {
      //   const markedMessage = state.chat[action.payload].map(item => {
      //     return item.read === false ? { ...item, read: true } : item;
      //   });
      //   return { ...state, chat: { 
      //     ...state.chat, 
      //     [action.payload]: markedMessage } };
      // } else {
      //   return state;
      // }
       const markedMessage = state.chat[action.payload].map(item => {
          return item.read === false ? { ...item, read: true } : item;
        });
        return { ...state, chat: { 
          ...state.chat, 
          [action.payload]: markedMessage } };
    case 'delete_message':
      const deletedMessage = state.chat[action.payload.user].map(item => {
        return item._id === action.payload.messageId ? { ...item, text: 'Message deleted', deleted: true } : item;
      });
      return { ...state, chat: {
        ...state.chat,
        [action.payload.user]: deletedMessage } };
    case 'create_group':
      return { ...state, previousChats: [action.payload].concat(state.previousChats) }; // [action.payload, ...state.previousChats]
    case 'update_group':
      let updatedGroup;
      if (action.payload.updatedProperty === 'name') {
        updatedGroup = state.previousChats.map(item => {
          return item.chatId === action.payload.updatedGroup._id ?
           { ...item, 
            contact: action.payload.updatedGroup.name,
            text: action.payload.adminMessage.text
           } : item;
        });
      }
      if (action.payload.updatedProperty === 'image') {
        updatedGroup = state.previousChats.map(item => {
          return item.chatId === action.payload.updatedGroup._id ?
           { ...item, 
            profile: {
              imgPath: action.payload.updatedGroup.avatar ?
                action.payload.updatedGroup.avatar.imagePath :
                null
            },
            text: action.payload.adminMessage.text
           } : item;
        });
      }
      return { ...state, previousChats: updatedGroup };
    case 'save_expo_token':
      return { ...state, expoToken: action.payload };
    case 'get_current_screen':
      return { ...state, currentScreen: action.payload };
    default:
      return state;
  }
};

const getChats = dispatch => async ({ username }) => {

  try {
    const response = await chatApi.post('/chats', { username });

    console.log(response.data)

    const chats = response.data.chats.sort((a, b) => new Date(b.date) - new Date(a.date));

    dispatch({ type: 'get_chats', payload: chats });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteChat = dispatch => async (username, chatId, type) => {
  try {
    const response = await chatApi.patch('/chat/delete', { username, chatId, type });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'delete_chat', payload: chatId });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateMessages = dispatch => ({ chatId, message }) => {
  dispatch({ type: 'update_messages', payload: { chatId, message } });
};

const updateChatState = dispatch => (chat) => {
  dispatch({ type: 'update_chat_state', payload: chat });
};

const addNewChat = dispatch => chat => {
  dispatch({ type: 'add_new_chat', payload: chat });
};

const resetChatState = dispatch => (user) => {
  dispatch({ type: 'reset_chat_state', payload: user });
};

const toggleMuteChat = dispatch => async (username, chatId, type, currentValue) => {
  try {
    const response = await chatApi.patch('/chat/mute', { username, chatId, type, currentValue });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'mute_chat', payload: { chatId, currentValue } });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getMessages = dispatch => async ({ chatType, chatId, username, recipient, page }) => {

  try {

    const response = await chatApi.post('/messages', { chatType, chatId, username, recipient, page });

    const chatArr = [];

    if (chatType === 'private') {
      response.data.messages.map(message => {
        chatArr.push({
          _id: message.message.id,
          text: message.message.text,
          createdAt: message.message.createdAt,
          user: {
            _id: message.from === username ? 1 : 2,
            name: message.from === username ? username : recipient
          },
          read: message.read,
          deleted: message.deleted,
          reply: message.replyTo ? message.replyTo.messageText : null,
          replyAuthor: message.replyTo ? message.replyTo.messageAuthor : null,
          image: message.image ? message.image.imgPath : ''
        });
      });
    }

    if (chatType === 'group') {
      response.data.messages.map(message => {
        chatArr.push({
          _id: message.message.giftedChatId ? message.message.giftedChatId : message._id,
          text: message.message.text,
          createdAt: message.message.created,
          user: {
            _id: message.from === username ? 1 : 2,
            name: message.from
          },
          read: message.read,
          deleted: message.deleted,
          reply: message.reply ? message.reply.originalMsgText : null,
          replyAuthor: message.reply ? message.reply.originalMsgAuthor : null,
          image: message.image ? message.image.imgPath : ''
        });
      });
    }

    dispatch({ type: 'get_messages', payload: { chatId: chatId, messages: chatArr } });
  
    return chatArr;

  } catch (err) {
    console.log(err);
    throw err;
  } 
};

const markMessagesAsRead = dispatch => async ({ username, recipient }) => {

  try {
    const response = await chatApi.patch('/messages/clear', { username, recipient });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'mark_messages_read', payload: recipient });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const markMessageAsRead = dispatch => async ({ user }) => {
  // try {
  //   const response = await chatApi.patch('/message/read', { username, recipient });

  //   if (!response.data.response) {
  //     return;
  //   }

  dispatch({ type: 'mark_message_read', payload: user });
  // } catch (err) {
  //   console.log(err);
  //   throw err;
  // }
};

const deleteMessage = dispatch => async ({ user, messageId }) => {
  try {
    const response = await chatApi.patch('/message/delete', { messageId });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'delete_message', payload: { user, messageId } });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteMessageState = dispatch => async ({ user, messageId }) => {
  dispatch({ type: 'delete_message', payload: { user, messageId } });
};

const createGroup = dispatch => async ({ username, groupName, groupImage = '', groupMembers = [] }) => {
  
  try {
    let allMembers = groupMembers.slice();
    allMembers.push(username);

    const groupMembersStr = JSON.stringify(allMembers);

    let formData = new FormData();

    if (groupImage) {
      let uriParts = groupImage.split('.');
      let fileType = uriParts[uriParts.length - 1];

      formData.append('group', {
        uri: groupImage,
        name: `${username}_${groupName}`,
        type: `image/${fileType}`
      });      
    }

    formData.append('username', username);
    formData.append('groupName', groupName);
    formData.append('groupMembers', groupMembersStr);

    const response = await chatApi.post('/group/new', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    dispatch({ type: 'create_group', payload: response.data.newGroup });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateGroup = dispatch => (updatedGroup, updatedProperty, adminMessage) => {
  dispatch({ type: 'update_group', payload: { updatedGroup, updatedProperty, adminMessage } });
};

const resetBadgeCount = dispatch => async (username) => {
  try {
    const response = await chatApi.post('/badge/clear', { username });

    if (!response.data) {
      return;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const saveExpoToken = dispatch => async (expoToken, username) => {
  try {
    const response = await chatApi.post('/expo/token', { expoToken, username });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'save_expo_token', payload: response.data.expoToken });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getCurrentScreen = dispatch => screen => {
  dispatch({ type: 'get_current_screen', payload: screen });
};

const saveMessageImage = dispatch => async (data) => {

  try {
    const fileName = data.message[0].image.split('/').pop();
    const newPath = FileSystem.documentDirectory + fileName;

    let uriParts = data.message[0].image.split('.');
    let fileType = uriParts[uriParts.length - 1];
    let formData = new FormData();

    formData.append('imageMessage', {
      uri: data.message[0].image,
      name: `${data.chatId}`,
      type: `image/${fileType}` 
    });

    const response = await chatApi.post(
      '/message/image/save', 
      formData , 
      { headers: { 'Content-Type': 'multipart/form-data' }}
    );

    if (!response.data) {
      return;
    }

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { 
    getChats, 
    deleteChat,
    getMessages,
    updateMessages,
    markMessagesAsRead,
    deleteMessage,
    createGroup,
    resetChatState,
    toggleMuteChat,
    saveExpoToken,
    markMessageAsRead,
    deleteMessageState,
    resetBadgeCount,
    getCurrentScreen,
    updateChatState,
    saveMessageImage,
    updateGroup,
    addNewChat
  },
  {  
    previousChats: [], 
    // chat: [],
    chat: {},
    expoToken: null,
    currentScreen: null
  }
);