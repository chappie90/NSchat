import axios from 'axios';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'get_messages':
      return { ...state, chat: [ ...action.payload ] }; // change to chat: [ ...chat, action.payload ]
    case 'reset_chat_state':
      return { ...state, chat: [] };
    case 'update_messages':
      return { ...state, chat: [action.payload].concat(state.chat) };
    case 'get_chats':
      return { ...state, previousChats: action.payload };
    case 'delete_chat':
      const updatedChats = state.previousChats.filter(item => item.chatId !== action.payload );
      return { ...state, previousChats: updatedChats };
    case 'pin_chat':
      let newChats;
      let pinnedChat = state.previousChats.find(p => p.chatId === action.payload.chatId);
      pinnedChat.pinned = !action.payload.currentValue;
      if (pinnedChat.pinned) {
        newChats = [pinnedChat, ...state.previousChats.filter(item => item.chatId !== action.payload.chatId)];
      } else {  
        newChats = state.previousChats.sort((a, b) => new Date(b.date) - new Date(a.date));
        newChats.sort((a, b) => (a.pinned === b.pinned) ? 0 : a.pinned ? -1 : 1);
      }
      return { ...state, previousChats: newChats };
    case 'mark_messages_read':
      const markedMessages = state.previousChats.map(item => {
        return item.contact === action.payload ? { ...item, unreadMessageCount: 0 } : item;
      });
      return { ...state, previousChats: markedMessages };
    case 'delete_message':
      const deletedMessage = state.chat.map(item => {
        return item._id === action.payload ? { ...item, text: 'Message deleted', deleted: true } : item;
      });
      return { ...state, chat: deletedMessage };
    case 'create_group':
      return { ...state, previousChats: [action.payload].concat(state.previousChats) }; // [action.payload, ...state.previousChats]
    default:
      return state;
  }
};

const getChats = dispatch => async ({ username }) => {
  const source = axios.CancelToken.source();

  try {
    const response = await chatApi.post('/chats', { username }, { cancelToken: source.token });
    
    const chats = response.data.chats.sort((a, b) => new Date(b.date) - new Date(a.date));

    chats.sort((a, b) => (a.pinned === b.pinned) ? 0 : a.pinned ? -1 : 1);

    dispatch({ type: 'get_chats', payload: chats });
  } catch (err) {
    console.log(err);
    source.cancel();
    if (axios.isCancel(err)) {
      console.log(err);
      console.log('request cancelled')
    }
  }
};

const deleteChat = dispatch => async (username, chatId, type) => {
  try {
    const response = await chatApi.patch('/chat/delete', { username, chatId, type });

    if (!response.data) {
      return;
    }

    console.log(response.data);

    dispatch({ type: 'delete_chat', payload: chatId });
  } catch (err) {
    console.log(err);
  }
};

const updateMessages = dispatch => ({ message }) => {
  dispatch({ type: 'update_messages', payload: message });
};

const resetChatState = dispatch => () => {
  dispatch({ type: 'reset_chat_state' });
};

const togglePinChat = dispatch => async (username, chatId, type, currentValue) => {
  try {
    const response = await chatApi.patch('/chat/pin', { username, chatId, type, currentValue });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'pin_chat', payload: { chatId, currentValue }});
  } catch (err) {
    console.log(err);
  }
};

const getMessages = dispatch => async ({ username, recipient, page }) => {
  try {

    const response = await chatApi.post('/messages', { username, recipient, page });

    const chatArr = [];

    const chat = response.data.messages.map(message => {
      if (message.from === username) {
        chatArr.push({
          _id: message.message.id,
          text: message.message.text,
          createdAt: message.message.createdAt,
          user: {
            _id: 1,
            name: username
          },
          read: message.read,
          deleted: message.deleted,
          reply: message.replyTo ? message.replyTo.messageText : null,
          replyAuthor: message.replyTo ? message.replyTo.messageAuthor : null
        });
      } else {
        chatArr.push({
          _id: message.message.id,
          text: message.message.text,
          createdAt: message.message.createdAt,
          user: {
            _id: 2,
            name: recipient
          },
          read: message.read,
          deleted: message.deleted,
          reply: message.replyTo ? message.replyTo.messageText : null,
          replyAuthor: message.replyTo ? message.replyTo.messageAuthor : null
        });
      }
    });

    dispatch({ type: 'get_messages', payload: chatArr });

    return chatArr;

  } catch (err) {
    console.log(err);
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
  }
};

const deleteMessage = dispatch => async ({ messageId }) => {
  try {
    const response = await chatApi.patch('/message/delete', { messageId });

    if (!response.data) {
      return;
    }

    dispatch({ type: 'delete_message', payload: messageId });
  } catch (err) {
    console.log(err);
  }
};

const createGroup = dispatch => async ({ username, groupName, groupImage = '', groupMembers = '' }) => {
  
  try {
    let uriParts = groupImage.split('.');
    let fileType = uriParts[uriParts.length - 1];

    groupMembers.push(username);

    const groupMembersStr = JSON.stringify(groupMembers);

    let formData = new FormData();

    formData.append('group', {
      uri: groupImage,
      name: `${username}_${groupName}`,
      type: `image/${fileType}`
    });
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
    togglePinChat
  },
  {  
    previousChats: [], 
    chat: []
  }
);