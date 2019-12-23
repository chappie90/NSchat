import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://b1a96ff3.ngrok.io'
});

export default instance;
