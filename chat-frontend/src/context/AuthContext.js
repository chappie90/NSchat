import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { token: action.payload };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ email, password }) => {
  try {
    const response = await chatApi.post('/signup', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

const signin = dispatch => async ({ email, password }) => {
  try {
    const response = await chatApi.post('/signin', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup, signin },
  { token: null }
);