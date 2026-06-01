import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../context/authStore';

let socketInstance = null;

const useSocket = () => {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // keep socket alive across page changes, only disconnect on logout
    };
  }, [token]);

  return socketRef.current;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default useSocket;
