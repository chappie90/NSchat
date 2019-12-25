import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://d167a168.ngrok.io'
});

export default instance;
