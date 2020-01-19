import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.0.93:3000'
});

export default instance;
