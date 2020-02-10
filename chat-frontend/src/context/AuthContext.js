import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { token: action.payload.token, username: action.payload.username, errorMessage: '' };
    case 'signout':
      return { token: null, username: null, errorMessage: '' };
      // return { state: undefined };
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'clear_error':
      return { ...state, errorMessage: '' };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signup', { username, password });

    const dataObj = { username: response.data.username, token: response.data.token };
    await AsyncStorage.setItem('data', JSON.stringify(dataObj));

    dispatch({ type: 'signin', payload: response.data });

    navigate('MainFlow');
  } catch (error) {
    if (error.response) {
      dispatch({ type: 'add_error', payload: error.response.data.message });
    }
  }
};

const signin = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signin', { username, password });

    const dataObj = { username: response.data.username, token: response.data.token };
    await AsyncStorage.setItem('data', JSON.stringify(dataObj));

    // console.log('context');
    // console.log(dataObj);
    // console.log(response.data.username);
    // console.log('end-context');

    dispatch({ type: 'signin', payload: response.data });

    navigate('MainFlow');
  } catch (error) {
    if (error.response) {
      dispatch({ type: 'add_error', payload: error.response.data.message });
    }
  }
};

const autoLogin = dispatch => async () => {
  let data = await AsyncStorage.getItem('data');
  data = JSON.parse(data);

  if (data && data.token) {
    dispatch({ type: 'signin', payload: data });
    setTimeout(() => {
      navigate('MainFlow');
    }, 4000);
  } else {
    navigate('Starter');
  }
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: 'clear_error' });
};

const signout = dispatch => async () => {
  try {
    await AsyncStorage.removeItem('data');

    dispatch({ type: 'signout' });

    navigate('Starter');
  } catch (err) {
    console.log(err);
  }  
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup, signin, autoLogin, clearErrorMessage, signout },
  { token: null, username: null, errorMessage: '' }
);