import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://6507b2c7.ngrok.io'
});

export default instance;
