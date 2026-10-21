import { Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '../../lib/format'
import CategoryChip from '../ui/CategoryChip'
import IconButton from '../ui/IconButton'

/** Title / Category / Action table. The trash button's meaning is set by the page. */
export default function ArticleTable({ articles, trashLabel, busyId, onTrash }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
            <th scope="col" className="py-3 pr-3 font-medium sm:pr-4">Title</th>
            <th scope="col" className="py-3 pr-3 font-medium sm:pr-4">Category</th>
            <th scope="col" className="w-20 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {articles.map((article) => (
            <tr key={article.id} className="transition-colors duration-150 hover:bg-canvas">
              <td className="min-w-32 py-3.5 pr-3 sm:min-w-56 sm:pr-4">
                <p className="line-clamp-2 font-medium">{article.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  Updated {formatDate(article.updated_date)}
                </p>
              </td>
              <td className="py-3.5 pr-3">
                <CategoryChip category={article.category} className="max-w-24 sm:max-w-48" />
              </td>
              <td className="py-3.5">
                <div className="flex justify-end gap-1">
                  <IconButton label="Edit article" to={`/edit/${article.id}`}>
                    <Pencil size={16} aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={trashLabel}
                    onClick={() => onTrash(article)}
                    disabled={busyId === article.id}
                    className="hover:text-danger"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Placeholder rows shown while the first page loads. */
export function ArticleTableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-line border-t border-line" aria-label="Loading articles">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-6 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 skeleton" />
            <div className="h-3 w-28 skeleton" />
          </div>
          <div className="h-5 w-20 skeleton" />
          <div className="h-8 w-16 skeleton" />
        </div>
      ))}
    </div>
  )
}
