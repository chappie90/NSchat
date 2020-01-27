import { AsyncStorage } from 'react-native';
import axios from 'axios';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'search_contacts':
      return { ...state, searchResults: action.payload };
    case 'clear_search_results':
      return { ...state, searchResults: [] };
    case 'new_contact':
      return { ...state, contacts: [ ...state.contacts, action.payload ] };
    case 'get_contacts':
      return { ...state, contacts: action.payload, contactsIsLoading: false }; // change to contacts: action.payload
    case 'get_messages':
      return { ...state, chat: [ ...action.payload ] }; // change to chat: [ ...chat, action.payload ]
    case 'get_chats':
      return { ...state, previousChats: action.payload, chatsIsLoading: false };
    case 'get_active_status':
      return { ...state, onlineContacts: action.payload };
    default:
      return state;
  }
};

const searchContacts = dispatch => async ({ username, search }) => {
  try {
    const response = await chatApi.post('/contacts/search', { username, search });
    if (response.data.contacts !== undefined || response.data.contacts.length != 0) {
      dispatch({ type: 'search_contacts', payload: response.data.contacts });
    }
  } catch (err) {
    console.log(err);
  }
};

const clearSearchResults = dispatch => () => {
  dispatch({ type: 'clear_search_results' });
};

const addContact = dispatch => async ({ username, contact }) => {
  try {
    const response = await chatApi.post('/contacts/add', { username, contact });
    
    dispatch({ type: 'new_contact', payload: response.data.contact });

    navigate('ContactsList');
  } catch (err) {
    console.log(err);
  }
};

const getContacts = dispatch => async ({ username }) => {
  try {
    const response = await chatApi.post('/contacts', { username });

    dispatch({ type: 'get_contacts', payload: response.data.contacts });

  } catch (err) {
    console.log(err);
  }
};

const getActiveStatus = dispatch => (users) => {
  if (Array.isArray(users)) {
    dispatch({ type: 'get_active_status', payload: users });
  } else {

  }

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
          _id: message._id,
          text: message.message.text,
          createdAt: message.message.createdAt,
          user: {
            _id: 1,
            name: username
          }
        });
      } else {
        chatArr.push({
          _id: message._id,
          text: message.message.text,
          createdAt: message.message.createdAt,
          user: {
            _id: 2,
            name: recipient
          }
        });
      }
    });

    dispatch({ type: 'get_messages', payload: chatArr });

    return chatArr;

  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { 
    searchContacts, 
    clearSearchResults, 
    addContact, 
    getContacts, 
    getChats, 
    getMessages,
    getActiveStatus 
  },
  { 
    searchResults: [], 
    contacts: [], 
    previousChats: [], 
    chat: [], 
    onlineContacts: [],
    contactsIsLoading: true,
    chatsIsLoading: true 
  }
);