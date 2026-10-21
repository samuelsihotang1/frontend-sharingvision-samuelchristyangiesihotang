import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { installFakeApi } from '../../test/fakeApi'
import { currentLocation, renderApp } from '../../test/renderApp'

describe('App layout and navigation', () => {
  it('links to All Posts, Add New and Preview, marking the current page', () => {
    installFakeApi()
    renderApp('/preview')

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'All Posts' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'Add New' })).toHaveAttribute('href', '/add')
    expect(within(nav).getByRole('link', { name: 'Preview' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'All Posts' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'New Article' })).toHaveAttribute('href', '/add')
    expect(screen.getByRole('link', { name: 'Sharing Vision home' })).toHaveAttribute('href', '/')
  })

  it('navigates between pages', async () => {
    installFakeApi()
    const { user } = renderApp('/')

    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Add New' }))

    expect(currentLocation()).toBe('/add')
    expect(screen.getByRole('heading', { name: 'Write a new article' })).toBeInTheDocument()
  })

  it('opens and closes the mobile menu', async () => {
    installFakeApi()
    const { user } = renderApp('/')

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('navigation', { name: 'Mobile' })

    await user.click(within(menu).getByRole('link', { name: 'Preview' }))
    expect(currentLocation()).toBe('/preview')
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument()
  })

  it('shows a not-found page for unknown URLs', () => {
    installFakeApi()
    renderApp('/does-not-exist')

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })
})
