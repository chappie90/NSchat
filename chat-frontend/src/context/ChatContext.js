import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const chatReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

const getContacts = dispatch => async ({ search }) => {
  try {
    const response = await chatApi.post('/contacts', { search });

    console.log(response); 
  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { getContacts },
  { contacts: null }
);