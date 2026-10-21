import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installFakeApi, makeArticle } from '../test/fakeApi'
import { currentLocation, renderApp } from '../test/renderApp'

// Eight published articles (ids 1-8) and one draft.
function seedArticles() {
  return installFakeApi([
    ...Array.from({ length: 8 }, (_, index) =>
      makeArticle(index + 1, { title: `Published blog post number ${index + 1}` }),
    ),
    makeArticle(9, { title: 'A draft that must stay hidden', status: 'draft' }),
  ])
}

describe('Preview page', () => {
  it('requests only published articles, 6 per page', async () => {
    const api = seedArticles()
    renderApp('/preview')

    expect(await screen.findByText('Published blog post number 8')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The latest articles and resources' })).toBeInTheDocument()

    expect(api.requests.filter((r) => r.method === 'GET')).toEqual([
      expect.objectContaining({ path: '/article/6/0', status: 'publish' }),
    ])
    expect(screen.queryByText('A draft that must stay hidden')).not.toBeInTheDocument()
  })

  it('renders a card per article with category, date and a link to the full article', async () => {
    seedArticles()
    renderApp('/preview')

    const card = await screen.findByRole('link', { name: /Published blog post number 8/ })
    expect(card).toHaveAttribute('href', '/preview/8')
    expect(card).toHaveTextContent('Technology')
    expect(card).toHaveTextContent('March 7, 2026')
    expect(screen.getAllByRole('link', { name: /Published blog post number/ })).toHaveLength(6)
  })

  it('changes ?page= and the request offset when a page button is clicked', async () => {
    const api = seedArticles()
    const { user } = renderApp('/preview')
    await screen.findByText('Published blog post number 8')

    await user.click(screen.getByRole('button', { name: 'Page 2' }))

    expect(currentLocation()).toBe('/preview?page=2')
    expect(await screen.findByText('Published blog post number 2')).toBeInTheDocument()
    expect(screen.queryByText('Published blog post number 8')).not.toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/6/6')[0].status).toBe('publish')
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('starts on the page given in the URL', async () => {
    const api = seedArticles()
    renderApp('/preview?page=2')

    expect(await screen.findByText('Published blog post number 1')).toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/6/6')).toHaveLength(1)
  })

  it('shows an empty state when nothing is published', async () => {
    installFakeApi([makeArticle(1, { status: 'draft' })])
    renderApp('/preview')

    expect(await screen.findByText('Nothing published yet')).toBeInTheDocument()
  })

  it('opens the full article, keeping its line breaks', async () => {
    seedArticles()
    const { user } = renderApp('/preview')

    await user.click(await screen.findByRole('link', { name: /Published blog post number 8/ }))

    expect(currentLocation()).toBe('/preview/8')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Published blog post number 8' }),
    ).toBeInTheDocument()
    const content = screen.getByText(/Paragraph one of article 8/)
    expect(content.textContent).toContain('\nParagraph two.')
    expect(content).toHaveClass('whitespace-pre-line')
    expect(screen.getByRole('link', { name: 'All articles' })).toHaveAttribute('href', '/preview')
  })

  it('does not show unpublished articles on the detail page', async () => {
    seedArticles()
    renderApp('/preview/9')

    expect(await screen.findByText('Article not available')).toBeInTheDocument()
    expect(screen.queryByText('A draft that must stay hidden')).not.toBeInTheDocument()
  })
})
