import createDataContext from './createDataContext';
import chatApi from '../api/chat';

import { navigate } from '../components/navigationRef';

const groupsReducer = (state, action) => {
  switch (action.type) {
    case 'get_current_group_id':
      return { ...state, currentGroupId: action.payload };
    case 'get_group':
      return { ...state, group: action.payload };
    case 'update_group_image':
      return { ...state, group: { ...state.group, avatar: { imagePath: action.payload } } };
     case 'update_group_name':
      return { ...state, group: { ...state.group, name: action.payload } };
    case 'update_group_members':
      return { ...state, group: { ...state.group, participants: action.payload } };
    case 'reset_group':
      return { ...state, group: {} }
    default:
      return state;  
  }
};

const getCurrentGroupId = dispatch => chatId => {
  dispatch({ type: 'get_current_group_id', payload: chatId });
};

const resetGroup = dispatch => () => {
  dispatch({ type: 'reset_group' });
};

const getGroup = dispatch => async (chatId) => {
  const params =  { chatId };

  try {
    const response = await chatApi.get('/group', { params });

    dispatch({ type: 'get_group', payload: response.data.group });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateGroupState = dispatch => async (group) => {
  dispatch({ type: 'get_group', payload: group[0] });
  return group[0];
};

const leaveGroup = dispatch => async (chatId, userId, username) => {
  try {
    const response = await chatApi.patch('/group/leave', { chatId, userId, username });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateGroupImage = dispatch => async (username, chatId, groupName, groupImageUri, groupImageBase64) => {

  try {
    
    let uriParts = groupImageUri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let base64Img = `data:image/jpg;base64,${groupImageBase64}`;

    let formData = new FormData();

    formData.append('groupImage', {
      uri: groupImageUri,
      name: `${username}_${groupName}`,
      type: `image/${fileType}`
    });

    formData.append('username', username);
    formData.append('chatId', chatId);
    formData.append('base64', base64Img);

    const response = await chatApi.post('/group/image/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    
    dispatch({ type: 'update_group_image', payload: response.data.group.avatar.imagePath });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }

};

const updateGroupName = dispatch => async (chatId, groupName, username) => {
  try {
    const response = await chatApi.patch('/group/name/update', { chatId, groupName, username });

    dispatch({type: 'update_group_name', payload: response.data.group.name });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteGroupImage = dispatch => async (chatId, username) => {
  try {
    const response = await chatApi.patch('/group/image/delete', { chatId, username});

    if (!response.data.group) {
      return;
    }
    dispatch({ type: 'update_group_image', payload: null });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addGroupMember = dispatch => async (username, chatId, newMembers) => {

  try {
    const response = await chatApi.patch('/group/participants/add', { username, chatId, newMembers });

    if (!response.data.group) {
      return;
    }

    dispatch({ type: 'update_group_members', payload: response.data.group.participants });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const { Context, Provider } = createDataContext(
  groupsReducer,
  { 
    getCurrentGroupId,
    getGroup,
    leaveGroup,
    updateGroupImage,
    deleteGroupImage,
    updateGroupName,
    addGroupMember,
    resetGroup,
    updateGroupState
  },
  { 
    currentGroupId: '',
    group: {},
  }
);