import Eyebrow from './ui/Eyebrow'

/** Eyebrow pill, large light heading, optional description and actions. */
export default function PageHeader({ eyebrowIcon, eyebrow, title, description, actions }) {
  return (
    <div className="flex animate-enter flex-col gap-6 pt-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <title>{`${title} · Sharing Vision`}</title>
      <div>
        <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-normal tracking-[-0.02em] sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
