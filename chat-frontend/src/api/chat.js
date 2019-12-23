import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://5fd4fb0e.ngrok.io'
});

export default instance;
