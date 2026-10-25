import Notification from '../models/Notification.js';
import { emitToUser } from '../socket.js';

// Saves a notification in MongoDB and pushes it live to the user's socket room.
export const notify = async ({ user, type, message, link }) => {
  const notification = await Notification.create({ user, type, message, link });
  emitToUser(user, 'notification', notification);
  return notification;
};
