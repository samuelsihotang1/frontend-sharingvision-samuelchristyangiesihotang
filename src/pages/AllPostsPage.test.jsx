import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installFakeApi, makeArticle } from '../test/fakeApi'
import { currentLocation, renderApp } from '../test/renderApp'

function seedArticles() {
  return installFakeApi([
    makeArticle(1, { title: 'Published article number one' }),
    makeArticle(2, { title: 'Published article number two', category: 'Science' }),
    makeArticle(3, { title: 'Published article number three' }),
    makeArticle(4, { title: 'Draft article number four', status: 'draft' }),
    makeArticle(5, { title: 'Draft article number five', status: 'draft' }),
    makeArticle(6, { title: 'Trashed article number six', status: 'thrash' }),
  ])
}

// Rows of the article table, without the header row.
async function findArticleRows() {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

async function expectTabCount(name, count) {
  const tab = screen.getByRole('tab', { name: new RegExp(name) })
  expect(await within(tab).findByText(String(count))).toBeInTheDocument()
}

describe('All Posts page', () => {
  it('shows the Published, Drafts and Trashed tabs with their counts', async () => {
    seedArticles()
    renderApp('/')

    await expectTabCount('Published', 3)
    await expectTabCount('Drafts', 2)
    await expectTabCount('Trashed', 1)
    expect(screen.getByRole('tab', { name: /Published/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('lists published articles in a table with title, category and edit/trash actions', async () => {
    const api = seedArticles()
    renderApp('/')

    const rows = await findArticleRows()
    expect(rows).toHaveLength(3)
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeInTheDocument()

    const newest = within(rows[0])
    expect(newest.getByText('Published article number three')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Science')).toBeInTheDocument()
    expect(newest.getByRole('link', { name: 'Edit article' })).toHaveAttribute('href', '/edit/3')
    expect(newest.getByRole('button', { name: 'Move to trash' })).toBeInTheDocument()

    const listRequest = api.requestsTo('GET', '/article/10/0').find((r) => r.status === 'publish')
    expect(listRequest).toBeDefined()
  })

  it('switches tabs, keeps the tab in the URL and requests the matching status', async () => {
    const api = seedArticles()
    const { user } = renderApp('/')
    await findArticleRows()

    await user.click(screen.getByRole('tab', { name: /Drafts/ }))

    expect(currentLocation()).toBe('/?tab=drafts')
    expect(await screen.findByText('Draft article number five')).toBeInTheDocument()
    expect(screen.queryByText('Published article number one')).not.toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/10/0').some((r) => r.status === 'draft')).toBe(true)
  })

  it('opens the tab named in ?tab=', async () => {
    const api = seedArticles()
    renderApp('/?tab=trashed')

    expect(await screen.findByText('Trashed article number six')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Trashed/ })).toHaveAttribute('aria-selected', 'true')
    expect(api.requestsTo('GET', '/article/10/0').some((r) => r.status === 'thrash')).toBe(true)
  })

  it('selects a tab when its stat card is clicked', async () => {
    seedArticles()
    const { user } = renderApp('/')
    await findArticleRows()

    const cards = screen.getAllByRole('button', { pressed: false })
    await user.click(cards.find((card) => card.textContent.startsWith('Trashed')))

    expect(currentLocation()).toBe('/?tab=trashed')
    expect(await screen.findByText('Trashed article number six')).toBeInTheDocument()
  })

  it('moves a published article to Trashed with PUT status "thrash" and refreshes', async () => {
    const api = seedArticles()
    const { user } = renderApp('/')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('button', { name: 'Move to trash' }))

    expect(await screen.findByText('Article moved to Trashed')).toBeInTheDocument()
    const [put] = api.requestsTo('PUT', '/article/3')
    expect(put.body).toEqual({
      title: 'Published article number three',
      content: makeArticle(3).content,
      category: 'Technology',
      status: 'thrash',
    })
    expect(api.requestsTo('DELETE', '/article/3')).toHaveLength(0)

    await waitFor(() => expect(screen.queryByText('Published article number three')).not.toBeInTheDocument())
    await expectTabCount('Published', 2)
    await expectTabCount('Trashed', 2)
  })

  it('moves a draft to Trashed too', async () => {
    const api = seedArticles()
    const { user } = renderApp('/?tab=drafts')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('button', { name: 'Move to trash' }))

    await waitFor(() => expect(api.requestsTo('PUT', '/article/5')).toHaveLength(1))
    expect(api.requestsTo('PUT', '/article/5')[0].body.status).toBe('thrash')
  })

  it('asks for confirmation in the Trashed tab and sends nothing on Cancel', async () => {
    const api = seedArticles()
    const { user } = renderApp('/?tab=trashed')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('button', { name: 'Delete permanently' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Delete permanently?' })
    expect(dialog).toHaveTextContent('Trashed article number six')

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(api.requests.filter((r) => r.method !== 'GET')).toHaveLength(0)
  })

  it('closes the confirmation with Escape', async () => {
    seedArticles()
    const { user } = renderApp('/?tab=trashed')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('button', { name: 'Delete permanently' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('deletes permanently with DELETE after confirming', async () => {
    const api = seedArticles()
    const { user } = renderApp('/?tab=trashed')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('button', { name: 'Delete permanently' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Article deleted permanently')).toBeInTheDocument()
    expect(api.requestsTo('DELETE', '/article/6')).toHaveLength(1)
    expect(await screen.findByText('Trash is empty')).toBeInTheDocument()
  })

  it('goes to the edit page when the edit icon is clicked', async () => {
    seedArticles()
    const { user } = renderApp('/')
    const rows = await findArticleRows()

    await user.click(within(rows[0]).getByRole('link', { name: 'Edit article' }))

    expect(currentLocation()).toBe('/edit/3')
    expect(await screen.findByRole('heading', { name: 'Edit article' })).toBeInTheDocument()
  })

  it('shows an empty state when a tab has no articles', async () => {
    installFakeApi([])
    renderApp('/')

    expect(await screen.findByText('No published articles yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Write an article/ })).toHaveAttribute('href', '/add')
  })

  it('shows the server message and a retry button when loading fails', async () => {
    const api = seedArticles()
    api.respondWith('GET', /^\/article\/10\/0$/, 500, { message: 'database is unavailable' })
    renderApp('/')

    expect(await screen.findByText('database is unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument()
  })

  it('paginates on the server with limit 10 and the right offset', async () => {
    const api = installFakeApi(Array.from({ length: 25 }, (_, index) => makeArticle(index + 1)))
    const { user } = renderApp('/')

    expect(await findArticleRows()).toHaveLength(10)
    expect(screen.getByText('Showing 1-10 of 25')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(currentLocation()).toBe('/?tab=published&page=2')
    expect(await screen.findByText('Showing 11-20 of 25')).toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/10/10')[0].status).toBe('publish')

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(await screen.findByText('Showing 21-25 of 25')).toBeInTheDocument()
    expect(api.requestsTo('GET', '/article/10/20')).toHaveLength(1)
    expect(await findArticleRows()).toHaveLength(5)
  })
})
