import { ChevronRight, Newspaper, Sparkles } from 'lucide-react'
import { useLocation, useSearchParams } from 'react-router-dom'
import ArticleCard, { ArticleCardSkeleton } from '../components/articles/ArticleCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Eyebrow from '../components/ui/Eyebrow'
import Pagination from '../components/ui/Pagination'
import { useArticleList } from '../hooks/useArticles'
import { STATUS } from '../lib/articleStatus'
import { parsePage, totalPages } from '../lib/pagination'

const PER_PAGE = 6

/** "Preview": a blog of every published article, paginated on the server. */
export default function PreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { search } = useLocation()
  const page = parsePage(searchParams.get('page'))
  const list = useArticleList({ status: STATUS.PUBLISH, limit: PER_PAGE, offset: (page - 1) * PER_PAGE })

  function goToPage(next) {
    setSearchParams({ page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let content
  if (list.error) {
    content = <ErrorState error={list.error} onRetry={list.reload} />
  } else if (!list.data) {
    content = (
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PER_PAGE }, (_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    )
  } else if (list.data.items.length === 0) {
    content = (
      <EmptyState
        icon={Newspaper}
        title="Nothing published yet"
        description="Published articles appear here as a blog."
        action={
          <Button to="/add">
            Write an article
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        }
      />
    )
  } else {
    content = (
      <>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.data.items.map((article) => (
            <ArticleCard key={article.id} article={article} backTo={`/preview${search}`} />
          ))}
        </div>
        <div className="mt-12">
          <Pagination
            page={page}
            totalPages={totalPages(list.data.total, PER_PAGE)}
            onChange={goToPage}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <title>Preview · Sharing Vision</title>
      <section className="relative mt-2 mb-12 animate-enter overflow-hidden rounded-2xl bg-mesh px-6 py-14 text-center sm:py-20">
        <Eyebrow icon={Sparkles}>Blog</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-normal tracking-[-0.02em] sm:text-6xl">
          The latest articles and resources
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] text-ink/70">
          Every published article from the Sharing Vision dashboard.
        </p>
      </section>
      {content}
    </>
  )
}
