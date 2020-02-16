import createDataContext from './createDataContext';
import chatApi from '../api/chat';

const groupsReducer = (state, action) => {
  switch (action.type) {
    case 'get_group':
      return { ...state, group: action.payload };
    default:
      return state;  
  }
};

const getGroup = dispatch => async (groupId) => {
  const params =  { groupId };

  try {
    const response = await chatApi.get('/group', { params });

    console.log(response.data);
    dispatch({ type: 'get_group', payload: response.data })
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const { Context, Provider } = createDataContext(
  groupsReducer,
  { 
    getGroup
  },
  { 
    group: {}
  }
);