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

const saveImage = dispatch => async (data) => {

  try {
    // const fileName = imageUri.split('/').pop();
    // const newPath = FileSystem.documentDirectory + fileName;

    // let base64Img = `data:image/jpg;base64,${base64}`;

    // let uriParts = imageUri.split('.');
    // let fileType = uriParts[uriParts.length - 1];
    // let formData = new FormData();

    // //body.append('authToken', 'secret'); don't really need it

    // // make sure this name is the same as multer({ storage: storage }).single('profile'),
    // // otherwise will get MulterError: Unexpected field error
    // formData.append('profile', {
    //   uri: imageUri,
    //   name: `${user}`,
    //   type: `image/${fileType}` 
    // });
    // formData.append('user', user);
    // formData.append('base64', base64Img);

    // let progress;

    // const response = await chatApi.post('/image/upload', formData , 
    //   {
    //     onUploadProgress: (progressEvent) => {
    //       const totalLength = progressEvent.lengthComputable ? 
    //         progressEvent.total : 
    //         progressEvent.target.getResponseHeader('content-length') || 
    //         progressEvent.target.getResponseHeader('x-decompressed-content-length');

    //       if (totalLength !== null) {
    //         progress = ((progressEvent.loaded * 100) / totalLength) * 0.8;
    //         console.log(progress)
    //           // this.updateProgressBarValue(Math.round( (progressEvent.loaded * 100) / totalLength ));
    //       }
    //     },
    //     headers: { 'Content-Type': 'multipart/form-data' }
    //   }
    // );

    if (data) {
      // await FileSystem.moveAsync({
      //   from: imageUri,
      //   to: newPath
      // });

      // const dbResult = await insertProfileImage(user, newPath);

      dispatch({ type: 'update_image', payload: data.img });
    }
  } catch (err) {
    console.log(err);
    throw err;
    // handle with alert
  }
};


const getImage = dispatch => async (user) => {
  const params = { user };
  let imagePayload, imgUrl;

  try {
    const response = await chatApi.get('/image', { params });

    if (response.data) {
      imagePayload = response.data.image;
    } else {
      const dbResult = await fetchProfileImage(user);
      imagePayload = dbResult.rows._array.length > 0 ? dbResult.rows._array[0].imageUri : null;   
    }

    dispatch({ type: 'update_image', payload: imagePayload });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteImage = dispatch => async (user) => {
  try {
    const response = await chatApi.patch('/image/delete', { username: user });

    if (!response.data.user) {
      return;
    }

    await deleteProfileImage(user);
    dispatch({ type: 'update_image', payload: null });
  } catch (err) {
    console.log(err);
    throw err;
    // throw err;
  }
};

export const { Context, Provider } = createDataContext(
  profileReducer,
  { saveImage, getImage, deleteImage },
  { profileImage: null }
);