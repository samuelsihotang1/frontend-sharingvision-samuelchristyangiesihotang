import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/format'
import CategoryChip from '../ui/CategoryChip'
import ArticleCover from './ArticleCover'

/** Blog card for the Preview page; opens the full article (backTo = where its back link goes). */
export default function ArticleCard({ article, backTo }) {
  return (
    <Link
      to={`/preview/${article.id}`}
      state={{ backTo }}
      className="group flex animate-enter flex-col rounded-2xl transition duration-200 hover:-translate-y-0.5"
    >
      <div className="relative">
        <ArticleCover
          id={article.id}
          className="aspect-[16/10] rounded-2xl transition-shadow duration-200 group-hover:shadow-glass"
        />
        <CategoryChip category={article.category} className="absolute top-3 left-3 shadow-sm" />
      </div>
      <div className="px-1 pt-4">
        <p className="text-xs text-muted">{formatDate(article.created_date)}</p>
        <h2 className="mt-1.5 line-clamp-2 font-display text-lg leading-snug tracking-[-0.01em] group-hover:underline group-hover:decoration-line group-hover:underline-offset-4">
          {article.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.content}</p>
      </div>
    </Link>
  )
}

/** Placeholder card shown while a page of articles loads. */
export function ArticleCardSkeleton() {
  return (
    <div>
      <div className="aspect-[16/10] rounded-2xl skeleton" />
      <div className="space-y-2 px-1 pt-4">
        <div className="h-3 w-24 skeleton" />
        <div className="h-5 w-4/5 skeleton" />
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-2/3 skeleton" />
      </div>
    </div>
  )
}
