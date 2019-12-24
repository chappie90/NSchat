import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://a541e6a8.ngrok.io'
});

export default instance;
