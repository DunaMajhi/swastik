import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (role) => {
  const s = getSocket();
  if (!s.connected) s.connect();
  if (role === 'admin') s.emit('join:admin');
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
