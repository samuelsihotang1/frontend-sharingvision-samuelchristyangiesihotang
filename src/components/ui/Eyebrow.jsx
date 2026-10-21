/** Small pill shown above page titles: a dark circle with an icon, then text. */
export default function Eyebrow({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-subtle py-1 pr-3 pl-1 text-xs text-ink/80">
      <span className="grid size-5 place-items-center rounded-full bg-ink text-white">
        <Icon size={11} strokeWidth={2.25} aria-hidden="true" />
      </span>
      {children}
    </span>
  )
}
