/** Centered empty / not-found message on a soft gradient blob, with an optional action. */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex animate-enter flex-col items-center px-6 py-16 text-center">
      <div className="relative mb-6 grid size-20 place-items-center">
        <div className="absolute inset-0 rounded-full bg-mesh blur-xl" aria-hidden="true" />
        <div className="relative grid size-12 place-items-center rounded-xl bg-white shadow-sm">
          <Icon size={20} className="text-ink" aria-hidden="true" />
        </div>
      </div>
      <h2 className="font-display text-xl tracking-[-0.02em]">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
