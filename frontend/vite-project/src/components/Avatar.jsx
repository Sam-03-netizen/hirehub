export default function Avatar({ user, size = 36 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (user?.avatar) return <img className="avatar" src={user.avatar} alt={user.name} style={style} />;
  return <span className="avatar avatar-fallback" style={style}>{(user?.name || '?').charAt(0).toUpperCase()}</span>;
}
