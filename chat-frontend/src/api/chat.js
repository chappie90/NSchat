import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://9d406958.ngrok.io'
});

export default instance;
