import { io } from "socket.io-client";

const SOCKET_URL = "https://chattify-realtime-chatapp.onrender.com"; 
const socket = io(SOCKET_URL, { 
  withCredentials: true, 
  transports: ['websocket', 'polling'], 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;