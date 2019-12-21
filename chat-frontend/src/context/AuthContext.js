import createDataContext from './createDataContext';
import chatApi from '../api/chat';

const authReducer = (state, action) => {

};

const signup = dispatch => async ({ email, password }) => {
  console.log(email);
  console.log(password);
  const response = await chatApi.post('/signup', { email, password });
  console.log(response);
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup },
  { }
);