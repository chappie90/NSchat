import io from 'socket.io-client';

const connectToSocket = (user) => {
  return io('http://178.62.22.9/', { query: `username=${user}` });  
};

export { connectToSocket };