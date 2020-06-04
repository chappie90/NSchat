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
    case 'update_socket':
      return { ...state, socketState: action.payload };
    case 'set_statusbar_color':
      return { ...state, statusBarColor: action.payload };
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

  if (data) {
    data = JSON.parse(data);
    if (data.token) {
      dispatch({ type: 'signin', payload: data });
      navigate('MainFlow');
    } else {
      navigate('Starter');
    }
  } else {
    navigate('Starter');
  }
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: 'clear_error' });
};

const signout = dispatch => async (userId) => {
  try {
    await AsyncStorage.removeItem('data');

    const response = await chatApi.patch('/signout', { userId });

    dispatch({ type: 'signout' });

    navigate('Starter');
  } catch (err) {
    console.log(err);
  }  
};

const updateSocketState = dispatch => (socketState) => {
  dispatch({ type: 'update_socket', payload: socketState });
};

const setStatusBarColor = dispatch => value => {
  dispatch({ type: 'set_statusbar_color', payload: value });
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup,
    signin, 
    autoLogin, 
    clearErrorMessage, 
    signout,
    updateSocketState,
    setStatusBarColor
  },
  { token: null, 
    userId: null, 
    username: null, 
    errorMessageSignin: '', 
    errorMessageSignup: '',
    socketState: null,
    statusBarColor: 1   
  }
);