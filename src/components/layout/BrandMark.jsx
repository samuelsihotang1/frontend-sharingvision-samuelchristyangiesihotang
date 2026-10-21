import { Link } from 'react-router-dom'

/** "SV" monogram in a dark rounded square, followed by the app name. */
export default function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Sharing Vision home">
      <span className="grid size-8 place-items-center rounded-lg bg-ink text-[13px] font-semibold tracking-tight text-white">
        SV
      </span>
      <span className="font-display text-lg font-medium tracking-[-0.02em] whitespace-nowrap">Sharing Vision</span>
    </Link>
  )
}
