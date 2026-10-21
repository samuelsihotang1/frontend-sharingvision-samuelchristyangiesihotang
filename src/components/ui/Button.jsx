import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-ink/85',
  secondary: 'border border-line bg-white text-ink hover:bg-canvas',
  danger: 'bg-danger text-white hover:bg-danger/90',
}

const SIZES = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-[13px]',
}

/** Button, or a router link styled as a button when `to` is given. */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap',
    'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
