import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://167.99.81.27:3000'
});

export default instance;
