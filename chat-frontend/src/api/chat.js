import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://991627d2.ngrok.io'
});

export default instance;
