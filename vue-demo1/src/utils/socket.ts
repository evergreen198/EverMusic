import { io } from 'socket.io-client'

const socketURL = import.meta.env.VITE_SOCKET_URL || undefined

const socket = io(socketURL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
})

export default socket
