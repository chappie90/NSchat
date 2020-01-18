import { AsyncStorage } from 'react-native';

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
      return { ...state, contacts: action.payload }; // change to contacts: action.payload
    case 'get_messages':
      return { ...state, chat: [ ...action.payload ] }; // change to chat: [ ...chat, action.payload ]
    case 'get_chats':
      return { ...state, previousChats: action.payload };
    case 'hide_contacts_spinner':
      return { ...state, contactsIsLoading: false }
    case 'hide_chats_spinner':
      return { ...state, chatsIsLoading: false }
    default:
      return state;
  }
};

const searchContacts = dispatch => async ({ search }) => {
  try {
    const response = await chatApi.post('/contacts/search', { search });
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

    dispatch({ type: 'hide_contacts_spinner' });
  } catch (err) {
    console.log(err);
  }
};

const getChats = dispatch => async ({ username }) => {
  try {
    const response = await chatApi.post('/chats', { username });

    const chats = response.data.chats.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date)
    });

    dispatch({ type: 'get_chats', payload: chats });

    dispatch({ type: 'hide_chats_spinner' });
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
    getMessages 
  },
  { 
    searchResults: [], 
    contacts: [], 
    previousChats: [], 
    chat: [], 
    contactsIsLoading: true,
    chatsIsLoading: true 
  }
);