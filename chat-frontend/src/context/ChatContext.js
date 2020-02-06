import axios from 'axios';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'get_messages':
      return { ...state, chat: [ ...action.payload ] }; // change to chat: [ ...chat, action.payload ]
    case 'get_chats':
      return { ...state, previousChats: action.payload, chatsIsLoading: false };
    case 'get_active_status':
      return { ...state, onlineContacts: action.payload };
    case 'mark_messages_read':
      const markedMessages = state.previousChats.map(item => {
        return item.contact === action.payload ? { ...item, unreadMessageCount: 0 } : item;
      });
      return { ...state, previousChats: markedMessages };
    case 'delete_message':
      const deletedMessage = state.chat.map(item => {
        return item._id === action.payload ? { ...item, text: 'Message deleted', deleted: true } : item;
      });
      return { ...state, chats: deletedMessage };
    default:
      return state;
  }
};

const getActiveStatus = dispatch => (users) => {
  dispatch({ type: 'get_active_status', payload: users });
};

const getChats = dispatch => async ({ username }) => {
  const source = axios.CancelToken.source();

  try {
    const response = await chatApi.post('/chats', { username }, { cancelToken: source.token });

    const chats = response.data.chats.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date)
    });

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
          deleted: message.deleted
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
          deleted: message.deleted
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

export const { Context, Provider } = createDataContext(
  chatReducer,
  { 
    getChats, 
    getMessages,
    getActiveStatus,
    markMessagesAsRead,
    deleteMessage
  },
  {  
    previousChats: [], 
    chat: [], 
    onlineContacts: [],
    chatsIsLoading: true 
  }
);