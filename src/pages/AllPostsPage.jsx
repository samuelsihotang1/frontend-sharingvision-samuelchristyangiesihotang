import { ChevronRight, FileText, LayoutDashboard, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { deleteArticle, updateArticle } from '../api/articles'
import ArticleTable, { ArticleTableSkeleton } from '../components/articles/ArticleTable'
import StatCards from '../components/articles/StatCards'
import StatusTabs from '../components/articles/StatusTabs'
import PageHeader from '../components/PageHeader'
import Button from '../components/ui/Button'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Pagination from '../components/ui/Pagination'
import { useArticleCounts, useArticleList } from '../hooks/useArticles'
import { useToast } from '../hooks/useToast'
import { STATUS, findTab } from '../lib/articleStatus'
import { parsePage, totalPages } from '../lib/pagination'

const PER_PAGE = 10

const EMPTY_TEXT = {
  published: { title: 'No published articles yet', description: 'Articles you publish will be listed here.' },
  drafts: { title: 'No drafts', description: 'Articles saved as a draft will be listed here.' },
  trashed: { title: 'Trash is empty', description: 'Articles you move to the trash will be listed here.' },
}

/** "All Posts": Published / Drafts / Trashed tabs, each a paginated table. */
export default function AllPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = findTab(searchParams.get('tab'))
  const page = parsePage(searchParams.get('page'))
  const notify = useToast()

  const list = useArticleList({ status: tab.status, limit: PER_PAGE, offset: (page - 1) * PER_PAGE })
  const counts = useArticleCounts()

  const [busyId, setBusyId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const total = list.data?.total ?? 0
  const lastPage = totalPages(total, PER_PAGE)
  const inTrash = tab.status === STATUS.THRASH

  // When the current page stops existing (its last article was moved away), go to the last page.
  useEffect(() => {
    if (list.data && page > lastPage) {
      setSearchParams({ tab: tab.key, page: String(lastPage) }, { replace: true })
    }
  }, [list.data, page, lastPage, tab.key, setSearchParams])

  const selectTab = (key) => setSearchParams({ tab: key })
  const goToPage = (next) => setSearchParams({ tab: tab.key, page: String(next) })

  const refresh = () => {
    list.reload()
    counts.reload()
  }

  async function handleTrash(article) {
    if (inTrash) {
      setPendingDelete(article)
      return
    }

    setBusyId(article.id)
    try {
      await updateArticle(article.id, { ...article, status: STATUS.THRASH })
      notify('Article moved to Trashed')
      refresh()
    } catch (error) {
      notify(error.message, { tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteArticle(pendingDelete.id)
      notify('Article deleted permanently')
      refresh()
    } catch (error) {
      notify(error.message, { tone: 'error' })
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  const cancelDelete = useCallback(() => setPendingDelete(null), [])

  let content
  if (list.error) {
    content = <ErrorState error={list.error} onRetry={list.reload} />
  } else if (!list.data) {
    content = <ArticleTableSkeleton />
  } else if (list.data.items.length === 0) {
    content = (
      <EmptyState
        icon={inTrash ? Trash2 : FileText}
        title={EMPTY_TEXT[tab.key].title}
        description={EMPTY_TEXT[tab.key].description}
        action={
          !inTrash && (
            <Button to="/add">
              Write an article
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          )
        }
      />
    )
  } else {
    const first = (page - 1) * PER_PAGE + 1
    const last = first + list.data.items.length - 1
    content = (
      <div className={`transition-opacity duration-150 ${list.loading ? 'opacity-60' : ''}`}>
        <ArticleTable
          articles={list.data.items}
          trashLabel={inTrash ? 'Delete permanently' : 'Move to trash'}
          busyId={busyId}
          onTrash={handleTrash}
        />
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            Showing {first}-{last} of {total}
          </p>
          <Pagination page={page} totalPages={lastPage} onChange={goToPage} />
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrowIcon={LayoutDashboard}
        eyebrow="Dashboard"
        title="All Posts"
        description="Manage published articles, drafts and the trash."
      />

      <StatCards counts={counts.data} activeKey={tab.key} onSelect={selectTab} />

      <div className="mt-10">
        <StatusTabs activeKey={tab.key} counts={counts.data} onSelect={selectTab} />
        <section id="articles-panel" role="tabpanel" aria-labelledby={`tab-${tab.key}`} className="pt-2">
          {content}
        </section>
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete permanently?"
        description={`"${pendingDelete?.title ?? ''}" will be removed for good. This cannot be undone.`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  )
}
