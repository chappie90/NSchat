import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('http://192.168.1.174:3000', { query: `username=${user}` });  
};

export { connectToSocket };