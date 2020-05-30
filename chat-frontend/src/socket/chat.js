import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('https://134.209.187.139', { query: `username=${user}` });  
};

export { connectToSocket };