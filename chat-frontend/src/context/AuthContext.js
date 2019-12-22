import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { token: action.payload };
    case 'signout':
      return { token: null };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signup', { username, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

const signin = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signin', { username, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

const autoLogin = dispatch => async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    dispatch({ type: 'signin', payload: token });
    setTimeout(() => {
      navigate('mainFlow');
    }, 4000);
  } else {
    navigate('Starter');
  }
};

const signout = dispatch => async () => {
  try {
    await AsyncStorage.removeItem('token');
    dispatch({ type: 'signout' });

    navigate('loginFlow');
  } catch (err) {
    console.log(err);
  }  
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup, signin, autoLogin, signout },
  { token: null }
);