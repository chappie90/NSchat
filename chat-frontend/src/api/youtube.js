import axios from 'axios';

const youtubeApiKey = 'AIzaSyAlGNuBDZvq0M4LCK3S2Joly3JGwRObMcc';

const instance = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    part: 'snippet',
    maxResults: 10,
    key: youtubeApiKey
  }
});

export default instance;