import { CircleCheck } from 'lucide-react'
import { MIN_LENGTH } from '../../lib/validation'

const RULES = [
  `Title of at least ${MIN_LENGTH.title} characters`,
  `Content of at least ${MIN_LENGTH.content} characters`,
  `Category of at least ${MIN_LENGTH.category} characters`,
  'Publish makes it public, Draft keeps it private',
]

/** Side card listing the article rules, on a soft lavender backdrop. */
export default function FormGuidelines() {
  return (
    <aside className="self-start rounded-2xl bg-mesh p-2">
      <div className="rounded-xl bg-white/90 p-5">
        <h2 className="font-display text-lg tracking-[-0.02em]">Before you publish</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-2.5 py-2.5">
              <CircleCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
