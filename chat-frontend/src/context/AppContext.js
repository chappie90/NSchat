import createDataContext from './createDataContext';

const appReducer = (state, action) => {
  switch (action.type) {
    case 'toggle_overlay':
      return { ...state, overlayMode: val };
    default:
      return state;
  }
};

const toggleOverlay = dispatch => val => {
  dispatch({ type: 'toggle_overlay', payload: val });
};

export const { Context, Provider } = createDataContext(
  appReducer,
  { toggleOverlay },
  { overlayMode: false }
);