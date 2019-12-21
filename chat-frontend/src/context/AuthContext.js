import createDataContext from './createDataContext';
import chatApi from '../api/chat';
import { navigate } from '../components/navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signin':
      return { token: action.payload };
    default: 
      return state;
  }
};

const signup = dispatch => async ({ email, password }) => {
  try {
    const response = await chatApi.post('/signup', { email, password });
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

const signin = dispatch => async ({ email, password }) => {
  try {
    console.log(email);
    console.log(password);

    const response = await chatApi.post('/signin', { email, password });
    dispatch({ type: 'signin', payload: response.data.token });

    navigate('mainFlow');
  } catch (err) {
    console.log(err);
  }
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup, signin },
  { token: null }
);