import { AsyncStorage } from 'react-native';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { 
        token: action.payload.token, 
        userId: action.payload.userId,
        username: action.payload.username, 
        errorMessageSignin: '',
        errorMessageSignup: ''  
      };
    case 'signout':
      return { token: null, username: null, errorMessage: '' };
      // return { state: undefined };
    case 'add_error_signin':
      return { ...state, errorMessageSignin: action.payload };
    case 'add_error_signup':
      return { ...state, errorMessageSignup: action.payload };
    case 'clear_error':
      return { ...state, errorMessageSignup: '', errorMessageSignin: '' };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signup', { username, password });

    const dataObj = { 
      userId: response.data.userId,
      username: response.data.username, 
      token: response.data.token 
    };
    await AsyncStorage.setItem('data', JSON.stringify(dataObj));

    dispatch({ type: 'signin', payload: response.data });

    navigate('MainFlow');
  } catch (error) {
    if (error.response) {
      dispatch({ type: 'add_error_signup', payload: error.response.data.message });
    }
  }
};

const signin = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signin', { username, password });

    const dataObj = { 
      userId: response.data.userId,
      username: response.data.username, 
      token: response.data.token 
    };
    await AsyncStorage.setItem('data', JSON.stringify(dataObj));

    dispatch({ type: 'signin', payload: response.data });

    navigate('MainFlow');
  } catch (error) {
    if (error.response) {
      dispatch({ type: 'add_error_signin', payload: error.response.data.message });
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
    }, 3000);
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
  { token: null, userId: null, username: null, errorMessageSignin: '', errorMessageSignup: '' }
);