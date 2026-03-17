// main.js 或 utils/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:7220', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
