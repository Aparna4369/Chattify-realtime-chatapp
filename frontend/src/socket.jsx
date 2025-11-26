import { io } from "socket.io-client";

// backend server URL (your Express + Socket.io server)
const SOCKET_URL = "http://localhost:3000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports:['websocket'],
});

export default socket;
