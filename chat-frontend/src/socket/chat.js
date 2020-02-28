import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('http://192.168.1.108:3000', { query: `username=${user}` });  
};

export { connectToSocket };