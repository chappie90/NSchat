import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://3cb40392.ngrok.io'
});

export default instance;
