import createDataContext from './createDataContext';
import chatApi from '../api/chat';

import { navigate } from '../components/navigationRef';

const groupsReducer = (state, action) => {
  switch (action.type) {
    case 'get_current_group_id':
      return { ...state, currentGroupId: action.payload };
    case 'get_group':
      return { ...state, group: action.payload };
    default:
      return state;  
  }
};

const getCurrentGroupId = dispatch => chatId => {
  dispatch({ type: 'get_current_group_id', payload: chatId });
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

const leaveGroup = dispatch => async (chatId, userId) => {
  try {
    const response = await chatApi.patch('/group/leave', { chatId, userId });

    if (response) {
      navigate('ChatsList');
    }
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
    leaveGroup
  },
  { 
    currentGroupId: '',
    group: {},
  }
);