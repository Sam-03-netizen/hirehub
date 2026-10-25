import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { markRead, markAllRead } from '../features/notificationsSlice';
import { timeAgo } from '../components/JobCard';

export default function Notifications() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.notifications.items);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="narrow">
      <div className="row-between">
        <h1>Notifications</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => dispatch(markAllRead())} disabled={unread === 0}>Mark all as read</button>
      </div>
      {items.length === 0 ? (
        <div className="empty"><h3>Nothing yet</h3><p className="muted">Updates about applications will show up here instantly.</p></div>
      ) : (
        <ul className="notif-list">
          {items.map((n) => (
            <li key={n._id} className={n.read ? '' : 'unread'}>
              <Link to={n.link} onClick={() => !n.read && dispatch(markRead(n._id))}>
                <span>{n.message}</span>
                <span className="muted small">{timeAgo(n.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
