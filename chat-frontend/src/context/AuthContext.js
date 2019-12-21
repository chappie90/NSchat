import createDataContext from './createDataContext';

const authReducer = (state, action) => {

};

const signup = dispatch => ({ email, password }) => {
  console.log(email);
  console.log(password);
};

export const { Context, Provider } = createDataContext(
  authReducer,
  { signup },
  { }
);