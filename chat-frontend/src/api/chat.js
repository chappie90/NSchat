import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://a59dbd54.ngrok.io'
});

export default instance;
