import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

let socket = null;

// P2 Fix: pass JWT token in socket handshake auth — backend middleware verifies it
export const getSocket = () => {
    if (!socket) {
        const token = localStorage.getItem('token');
        socket = io(SOCKET_URL, {
            auth: { token },
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default getSocket;
