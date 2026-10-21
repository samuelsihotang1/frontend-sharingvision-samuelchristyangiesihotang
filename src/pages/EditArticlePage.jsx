import { ArrowLeft, FileQuestion, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { updateArticle } from '../api/articles'
import ArticleForm from '../components/articles/ArticleForm'
import FormGuidelines from '../components/articles/FormGuidelines'
import PageHeader from '../components/PageHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { useArticle } from '../hooks/useArticles'
import { useToast } from '../hooks/useToast'
import { STATUS, TABS, tabKeyForStatus } from '../lib/articleStatus'

/** "Edit Article": load an article, edit it and save it as published or draft. */
export default function EditArticlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useToast()
  const { data: article, error, reload } = useArticle(id)

  if (error?.status === 404) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Article not found"
        description={`There is no article with id ${id}. It may have been deleted.`}
        action={<Button to="/">Back to All Posts</Button>}
      />
    )
  }
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!article) return <EditSkeleton />

  async function handleSubmit(values) {
    await updateArticle(id, values)
    notify(values.status === STATUS.PUBLISH ? 'Article published' : 'Article saved as draft')
    navigate(`/?tab=${tabKeyForStatus(values.status)}`)
  }

  const currentTab = TABS.find((tab) => tab.status === article.status)

  return (
    <>
      <PageHeader
        eyebrowIcon={Pencil}
        eyebrow="Edit Article"
        title="Edit article"
        description={`Currently in ${currentTab?.label ?? article.status}. Publish or save it as a draft.`}
        actions={
          <Button variant="secondary" to={`/?tab=${tabKeyForStatus(article.status)}`}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </Button>
        }
      />
      <div className="grid animate-enter gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ArticleForm initialValues={article} onSubmit={handleSubmit} />
        <FormGuidelines />
      </div>
    </>
  )
}

function EditSkeleton() {
  return (
    <div className="space-y-6 pt-6" aria-label="Loading article">
      <div className="h-6 w-28 rounded-full skeleton" />
      <div className="h-12 w-72 skeleton" />
      <div className="h-11 max-w-3xl skeleton" />
      <div className="h-60 max-w-3xl skeleton" />
      <div className="h-11 max-w-3xl skeleton" />
    </div>
  )
}
