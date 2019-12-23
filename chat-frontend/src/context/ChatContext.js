import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'search_contacts':
      return { ...state, searchResults: action.payload };
    case 'new_contact':
      return { ...state, contacts: [ ...state.contacts, action.payload ] };
    case 'get_contacts':
      return { ...state, contacts: action.payload };
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

    console.log(response.data.contacts);

    dispatch({ type: 'get_contacts', payload: response.data.contacts });
  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { searchContacts, addContact, getContacts },
  { searchResults: [], contacts: [] }
);