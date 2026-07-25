function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader" role="status" aria-live="polite" aria-label={label}>
      <span className="loader-ring" />
      <span>{label}</span>
    </div>
  )
}

export default Loader
