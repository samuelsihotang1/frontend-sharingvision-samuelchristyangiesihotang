import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installFakeApi, makeArticle } from '../test/fakeApi'
import { currentLocation, renderApp } from '../test/renderApp'

const ARTICLE = makeArticle(5, { title: 'Original title of the article', status: 'draft' })

describe('Edit Article page', () => {
  it('loads the article and prefills title, content and category', async () => {
    const api = installFakeApi([ARTICLE])
    renderApp('/edit/5')

    expect(await screen.findByLabelText('Title')).toHaveValue(ARTICLE.title)
    expect(screen.getByLabelText('Content')).toHaveValue(ARTICLE.content)
    expect(screen.getByLabelText('Category')).toHaveValue(ARTICLE.category)
    expect(screen.getByText(/Currently in Drafts/)).toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/5')).toHaveLength(1)
  })

  it('saves the edited article with PUT status "publish" and opens the Published tab', async () => {
    const api = installFakeApi([ARTICLE])
    const { user } = renderApp('/edit/5')

    const title = await screen.findByLabelText('Title')
    await user.clear(title)
    await user.paste('An edited title that is long enough')
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('Article published')).toBeInTheDocument()
    expect(api.requestsTo('PUT', '/article/5')[0].body).toEqual({
      title: 'An edited title that is long enough',
      content: ARTICLE.content.trim(),
      category: ARTICLE.category,
      status: 'publish',
    })
    await waitFor(() => expect(currentLocation()).toBe('/?tab=published'))
  })

  it('saves with PUT status "draft" when Draft is clicked', async () => {
    const api = installFakeApi([makeArticle(5, { status: 'publish' })])
    const { user } = renderApp('/edit/5')

    await screen.findByLabelText('Title')
    await user.click(screen.getByRole('button', { name: 'Draft' }))

    expect(await screen.findByText('Article saved as draft')).toBeInTheDocument()
    expect(api.requestsTo('PUT', '/article/5')[0].body.status).toBe('draft')
    await waitFor(() => expect(currentLocation()).toBe('/?tab=drafts'))
  })

  it('links back to the tab the article is in', async () => {
    installFakeApi([ARTICLE])
    renderApp('/edit/5')

    expect(await screen.findByRole('link', { name: 'Back' })).toHaveAttribute('href', '/?tab=drafts')
  })

  it('shows a not-found state for an unknown article', async () => {
    installFakeApi([])
    renderApp('/edit/99')

    expect(await screen.findByText('Article not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/')
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()
  })
})
