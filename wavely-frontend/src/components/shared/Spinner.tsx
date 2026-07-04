export default function Spinner({ small = false }: { small?: boolean }) {
  return (
    <div className={`d-flex justify-content-center align-items-center ${small ? 'py-2' : 'py-5'}`}>
      <div
        className="spinner-border text-primary"
        style={{ width: small ? '1.2rem' : '2rem', height: small ? '1.2rem' : '2rem' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
