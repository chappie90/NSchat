import createDataContext from './createDataContext';
import youtubeApi from '../api/youtube';
import axios from 'axios';

const youtubeApiKey = 'AIzaSyAlGNuBDZvq0M4LCK3S2Joly3JGwRObMcc';

const youtubeReducer = (state, action) => {
  switch (action.type) {
    case 'get_youtube_results':
      return { ...state, youtubeResults: action.payload };
    default:
      return state;
  }
};

const getYoutubeResults = dispatch => async (term) => {
 
  try {
    
      let response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          q: term,
          part: 'snippet',
          maxResults: 10,
          key: youtubeApiKey
        }
      });

      if (!response.data) {
        return;
      }

      console.log(response.data)

      dispatch({ type: 'get_youtube_results', payload: response.data.items });

    } catch (error) {
      console.log(error);
    }

};

export const { Context, Provider } = createDataContext(
  youtubeReducer,
  { getYoutubeResults },
  { youtubeResults: null }
);