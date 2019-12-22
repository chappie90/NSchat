import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'search_contacts':
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

const addContact = dispatch => async ({ user }) => {
  try {
    const response = await chatApi.post('/contacts/add', { user });
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { searchContacts },
  { contacts: [] }
);