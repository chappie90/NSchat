import createDataContext from './createDataContext';

const authReducer = (state, action) => {

};

export const { Context, Provider } = createDataContext(
  authReducer,
  { },
  { }
);