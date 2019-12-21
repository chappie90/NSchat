import createDataContext from './createDataContext';
import chatApi from '../api/chat';

const authReducer = (state, action) => {

};

const signup = dispatch => async ({ email, password }) => {
  const response = await chatApi.post('/signup', { email, password });
  console.log(response.data);
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup },
  { }
);