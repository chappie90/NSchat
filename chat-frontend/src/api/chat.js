import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://d95d0aa6.ngrok.io'
});

export default instance;
