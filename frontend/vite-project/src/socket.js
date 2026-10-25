import { io } from 'socket.io-client';
import { API_URL } from './api/axios';

// Connects only after login (see App.jsx); the JWT cookie authenticates the socket.
const socket = io(API_URL, { withCredentials: true, autoConnect: false });
export default socket;
