function FormField({ label, error, id, type = 'text', ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span className="form-label">{label}</span>
      <input id={id} className={error ? 'input input-error' : 'input'} type={type} {...props} />
      {error ? <span className="form-error">{error}</span> : null}
    </label>
  )
}

export default FormField
