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

    let uriParts = image.split('.');
    let fileType = uriParts[uriParts.length - 1];
    let formData = new FormData();

    //body.append('authToken', 'secret'); don't really need it

    // make sure this name is the same as multer({ storage: storage }).single('profile'),
    // otherwise will get MulterError: Unexpected field error
    formData.append('profile', {
      uri: image,
      name: `${user}.${fileType}`,
      type: `image/${fileType}` 
    });
    formData.append('user', user);

    const response = await chatApi.post('/image/upload', formData , { headers: { 'Content-Type': 'multipart/form-data' }});

    if (response.data) {
      await FileSystem.moveAsync({
        from: image,
        to: newPath
      });

      const dbResult = await insertProfileImage(user, newPath);

      dispatch({ type: 'update_image', payload: newPath });
    }
  } catch (err) {
    console.log(err);
    throw err;
    // handle with alert
  }
};

const getImage = dispatch => async (user) => {
  try {
    const dbResult = await fetchProfileImage(user);

    const imagePayload = dbResult.rows._array.length > 0 ? dbResult.rows._array[0].imageUri : null;

    dispatch({ type: 'update_image', payload: imagePayload });
  } catch (err) {
    console.log(err);
  }
};

const deleteImage = dispatch => async (user) => {
  try {
    await deleteProfileImage(user);
    dispatch({ type: 'update_image', payload: null })
  } catch (err) {
    console.log(err);
    // throw err;
  }
};

export const { Context, Provider } = createDataContext(
  profileReducer,
  { saveImage, getImage, deleteImage },
  { profileImage: null }
);