export default function Spinner({ full }) {
  return (
    <div className={full ? 'spinner-full' : 'spinner-wrap'}>
      <div className="spinner" aria-label="Loading" />
    </div>
  );
}
