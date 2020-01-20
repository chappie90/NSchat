import { AsyncStorage } from 'react-native';
import * as FileSystem from 'expo-file-system';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';
import { insertProfileImage, fetchProfileImage } from '../database/db';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { token: action.payload.token, username: action.payload.username, errorMessage: '' };
    case 'signout':
      return { token: null, username: null, errorMessage: '' };
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'clear_error':
      return { ...state, errorMessage: '' };
    case 'update_image':
      return { ...state, profileImage: action.payload };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ username, password }) => {
  try {
    const response = await chatApi.post('/signup', { username, password });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('token', response.data.username);
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

    navigate('LoginFlow');
  } catch (err) {
    console.log(err);
  }  
};

const saveImage = dispatch => async (user, image) => {
  try {
    const fileName = image.split('/').pop();
    const newPath = FileSystem.documentDirectory + fileName;

    await FileSystem.moveAsync({
      from: image,
      to: newPath
    });

    const dbResult = await insertProfileImage(user, newPath);

    dispatch({ type: 'update_image', payload: newPath });
  } catch (err) {
    console.log(err);
    throw err;
    // handle with alert
  }
};

const getImage = dispatch => async (user) => {
  try {
    const dbResult = await fetchProfileImage(user);

    dispatch({ type: 'update_image', payload: dbResult.rows._array[0].imageUri });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup, signin, autoLogin, clearErrorMessage, signout, saveImage, getImage },
  { token: null, username: null, errorMessage: '', profileImage: null }
);