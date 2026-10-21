import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ArticleCover from '../components/articles/ArticleCover'
import Button from '../components/ui/Button'
import CategoryChip from '../components/ui/CategoryChip'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { useArticle } from '../hooks/useArticles'
import { STATUS } from '../lib/articleStatus'
import { formatDate } from '../lib/format'

/** Full view of one published article, opened from a Preview card. */
export default function PreviewArticlePage() {
  const { id } = useParams()
  const { state } = useLocation()
  const backTo = state?.backTo ?? '/preview'
  const { data: article, error, reload } = useArticle(id)

  if (error?.status === 404 || (article && article.status !== STATUS.PUBLISH)) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Article not available"
        description="This article does not exist or is not published."
        action={<Button to="/preview">Back to the blog</Button>}
      />
    )
  }
  if (error) return <ErrorState error={error} onRetry={reload} />

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pt-6" aria-label="Loading article">
        <div className="h-56 rounded-2xl skeleton" />
        <div className="h-10 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-5/6 skeleton" />
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl animate-enter pt-4">
      <title>{`${article.title} · Sharing Vision`}</title>
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All articles
      </Link>

      <ArticleCover id={article.id} className="mt-6 h-48 rounded-2xl sm:h-64" />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <CategoryChip category={article.category} />
        <span className="text-xs text-muted">{formatDate(article.created_date)}</span>
      </div>
      <h1 className="mt-4 font-display text-3xl font-normal tracking-[-0.02em] sm:text-5xl">
        {article.title}
      </h1>
      <div className="mt-8 text-[15px] leading-7 whitespace-pre-line text-ink/85">
        {article.content}
      </div>
    </article>
  )
}
