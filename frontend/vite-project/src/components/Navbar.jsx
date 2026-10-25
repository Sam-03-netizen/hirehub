import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { logout } from '../features/authSlice';
import Avatar from './Avatar';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const unread = useSelector((s) => s.notifications.items.filter((n) => !n.read).length);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">HireHub</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Browse jobs</NavLink>
          {user?.role === 'candidate' && <NavLink to="/my-applications">My applications</NavLink>}
          {user?.role === 'recruiter' && <NavLink to="/recruiter/jobs">My job posts</NavLink>}
        </nav>
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/notifications" className="bell" aria-label={`Notifications, ${unread} unread`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
                {unread > 0 && <span className="badge-count">{unread > 9 ? '9+' : unread}</span>}
              </Link>
              <Link to="/profile" className="nav-user" title="Your profile">
                <Avatar user={user} size={32} />
                <span className="nav-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
