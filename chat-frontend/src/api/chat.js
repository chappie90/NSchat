import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://2047ec60.ngrok.io'
});

export default instance;
