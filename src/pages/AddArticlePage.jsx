import { PenLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createArticle } from '../api/articles'
import ArticleForm from '../components/articles/ArticleForm'
import FormGuidelines from '../components/articles/FormGuidelines'
import PageHeader from '../components/PageHeader'
import { useToast } from '../hooks/useToast'
import { STATUS, tabKeyForStatus } from '../lib/articleStatus'

/** "Add New": create an article as published or draft. */
export default function AddArticlePage() {
  const navigate = useNavigate()
  const notify = useToast()

  async function handleSubmit(article) {
    await createArticle(article)
    notify(article.status === STATUS.PUBLISH ? 'Article published' : 'Article saved as draft')
    navigate(`/?tab=${tabKeyForStatus(article.status)}`)
  }

  return (
    <>
      <PageHeader
        eyebrowIcon={PenLine}
        eyebrow="Add New"
        title="Write a new article"
        description="Fill in the title, content and category, then publish it or keep it as a draft."
      />
      <div className="grid animate-enter gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <ArticleForm onSubmit={handleSubmit} />
        <FormGuidelines />
      </div>
    </>
  )
}
