import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://2740722a.ngrok.io'
});

export default instance;
