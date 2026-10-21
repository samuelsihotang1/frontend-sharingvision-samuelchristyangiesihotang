import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installFakeApi } from '../test/fakeApi'
import { currentLocation, renderApp } from '../test/renderApp'

const NEW_ARTICLE = {
  title: 'A brand new article written in a test',
  content: 'This content is long enough. '.repeat(10).trim(),
  category: 'Testing',
}

async function fillForm(user) {
  await user.click(screen.getByLabelText('Title'))
  await user.paste(NEW_ARTICLE.title)
  await user.click(screen.getByLabelText('Content'))
  await user.paste(NEW_ARTICLE.content)
  await user.click(screen.getByLabelText('Category'))
  await user.paste(NEW_ARTICLE.category)
}

describe('Add New page', () => {
  it('shows the Title, Content and Category form with Publish and Draft', () => {
    installFakeApi()
    renderApp('/add')

    expect(screen.getByRole('heading', { name: 'Write a new article' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
    expect(screen.getByLabelText('Content')).toHaveValue('')
    expect(screen.getByLabelText('Category')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Draft' })).toBeInTheDocument()
  })

  it('creates a published article with POST and opens the Published tab', async () => {
    const api = installFakeApi()
    const { user } = renderApp('/add')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('Article published')).toBeInTheDocument()
    expect(api.requestsTo('POST', '/article/')).toEqual([
      expect.objectContaining({ body: { ...NEW_ARTICLE, status: 'publish' } }),
    ])
    await waitFor(() => expect(currentLocation()).toBe('/?tab=published'))
    expect(await screen.findByText(NEW_ARTICLE.title)).toBeInTheDocument()
  })

  it('creates a draft with POST and opens the Drafts tab', async () => {
    const api = installFakeApi()
    const { user } = renderApp('/add')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Draft' }))

    expect(await screen.findByText('Article saved as draft')).toBeInTheDocument()
    expect(api.requestsTo('POST', '/article/')[0].body.status).toBe('draft')
    await waitFor(() => expect(currentLocation()).toBe('/?tab=drafts'))
  })

  it('does not send anything while the form is invalid', async () => {
    const api = installFakeApi()
    const { user } = renderApp('/add')

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(api.requestsTo('POST', '/article/')).toHaveLength(0)
    expect(currentLocation()).toBe('/add')
  })

  it('shows 422 errors from the server under the matching fields', async () => {
    const api = installFakeApi()
    api.respondWith('POST', /^\/article\/$/, 422, {
      message: 'validation failed',
      errors: { title: 'title must be at least 20 characters' },
    })
    const { user } = renderApp('/add')

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('title must be at least 20 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(currentLocation()).toBe('/add')
  })
})
