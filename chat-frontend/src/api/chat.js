import axios from 'axios';
import axiosRetry from 'axios-retry';
import { AsyncStorage } from 'react-native';

const instance = axios.create({
  // baseURL: 'http://178.62.22.9/' 
  baseURL: 'http://192.168.0.2:3000'
});

axiosRetry(instance, { retries: 3 });

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
