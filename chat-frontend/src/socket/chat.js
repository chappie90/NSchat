import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('http://192.168.0.31:3000', { query: `username=${user}` });  
};

export { connectToSocket };