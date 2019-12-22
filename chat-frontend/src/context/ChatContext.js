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

const getContacts = dispatch => async () => {

};

export const { Context, Provider } = createDataContext(
  chatReducer,
  { },
  { contacts: null }
);