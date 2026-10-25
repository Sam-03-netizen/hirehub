import { io } from 'socket.io-client';
import api, { API_URL } from './api/axios';

const socket = io(API_URL, {
  autoConnect: false,
  auth: (cb) => {
    api.get('/auth/socket-token')
      .then((res) => cb({ token: res.data.token }))
      .catch(() => cb({}));
  },
});

export default socket;
