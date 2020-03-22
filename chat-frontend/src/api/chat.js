import axios from 'axios';
import { AsyncStorage } from 'react-native';

const instance = axios.create({
  baseURL: 'http://192.168.1.174:3000' 
});

instance.interceptors.request.use(
  async (config) => {
    let data = await AsyncStorage.getItem('data');
    data = JSON.parse(data);

    if (data && data.token) {
      config.headers.Authorization = `Bearer ${data.token}`; 
    }
    return config;
  }, 
  (err) => {
    return Promise.reject(err);
  }
);

export default instance;
