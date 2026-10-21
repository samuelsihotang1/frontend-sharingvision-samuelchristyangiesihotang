import { Link } from 'react-router-dom'

const BASE =
  'inline-grid size-8 place-items-center rounded-lg text-muted transition-colors duration-150 ' +
  'hover:bg-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

/** Small square ghost button holding only an icon; `label` is its aria-label and tooltip. */
export default function IconButton({ label, to, className = '', children, ...props }) {
  const classes = `${BASE} ${className}`

  if (to) {
    return (
      <Link to={to} aria-label={label} title={label} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={label} title={label} className={classes} {...props}>
      {children}
    </button>
  )
}
