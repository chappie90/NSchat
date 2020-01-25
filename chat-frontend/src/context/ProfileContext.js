import * as FileSystem from 'expo-file-system';

import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { insertProfileImage, fetchProfileImage, deleteProfileImage } from '../database/db';

const profileReducer = (state, action) => {
  switch (action.type) {
    case 'update_image':
      return { ...state, profileImage: action.payload };
    default:
      return state;
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

const deleteImage = dispatch => async (user) => {
  try {
    await deleteProfileImage(user);
    dispatch({ type: 'update_image', payload: null })
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const { Context, Provider } = createDataContext(
  profileReducer,
  { saveImage, getImage, deleteImage },
  { profileImage: null }
);