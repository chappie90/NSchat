import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('http://192.168.0.2:3000', { query: `username=${user}` });  
  // return io('http://178.62.22.9/', { query: `username=${user}` });
};

export { connectToSocket };