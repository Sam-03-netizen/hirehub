import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

let io;

// Every logged-in user joins a private room named after their user id.
// The JWT is read from the same httpOnly cookie used by the REST API.
export const initSocket = (server, origins) => {
  io = new Server(server, { cors: { origin: origins, credentials: true } });

  io.use((socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || '');
      if (!cookies.token) return next(new Error('Not authenticated'));
      const { id } = jwt.verify(cookies.token, process.env.JWT_SECRET);
      socket.userId = id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(String(socket.userId));
    console.log(`Socket connected: user ${socket.userId}`);
    socket.on('disconnect', () => console.log(`Socket disconnected: user ${socket.userId}`));
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (io) io.to(String(userId)).emit(event, payload);
};
