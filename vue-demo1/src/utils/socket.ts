// main.js 或 utils/socket.js
import { io } from 'socket.io-client';




// 使用相对路径，让Vite代理处理跨域
const socket = io('/', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
