import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/articles'
import ArticleForm from './ArticleForm'

const VALID = {
  title: 'Understanding React state in depth',
  content: 'React state '.repeat(20), // 240 characters
  category: 'Technology',
}

async function fillForm(user, values) {
  for (const [label, value] of Object.entries(values)) {
    const field = screen.getByLabelText(label)
    await user.clear(field)
    if (value) {
      await user.click(field)
      await user.paste(value)
    }
  }
}

describe('ArticleForm', () => {
  it('shows the title, content and category fields with Publish and Draft buttons', () => {
    render(<ArticleForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Draft' })).toBeInTheDocument()
  })

  it('shows validation errors and does not submit an empty form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ArticleForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Content is required')).toBeInTheDocument()
    expect(screen.getByText('Category is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows minimum length errors for values that are too short', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ArticleForm onSubmit={onSubmit} />)

    await fillForm(user, { Title: 'Too short', Content: 'Also short', Category: 'ab' })
    await user.click(screen.getByRole('button', { name: 'Draft' }))

    expect(screen.getByText('Title must be at least 20 characters')).toBeInTheDocument()
    expect(screen.getByText('Content must be at least 200 characters')).toBeInTheDocument()
    expect(screen.getByText('Category must be at least 3 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed values with status "publish" when Publish is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ArticleForm onSubmit={onSubmit} />)

    await fillForm(user, { Title: `  ${VALID.title}  `, Content: VALID.content, Category: VALID.category })
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      title: VALID.title,
      content: VALID.content.trim(),
      category: VALID.category,
      status: 'publish',
    })
  })

  it('submits with status "draft" when Draft is clicked, starting from initial values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ArticleForm initialValues={{ ...VALID, id: 3, status: 'publish' }} onSubmit={onSubmit} />)

    expect(screen.getByLabelText('Title')).toHaveValue(VALID.title)
    await user.click(screen.getByRole('button', { name: 'Draft' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: VALID.title, status: 'draft' }))
  })

  it('shows field errors returned by the server (HTTP 422)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError('validation failed', {
        status: 422,
        fieldErrors: { category: 'category is not allowed' },
      }),
    )
    render(<ArticleForm initialValues={VALID} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('category is not allowed')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('validation failed')
    expect(screen.getByRole('button', { name: 'Publish' })).toBeEnabled()
  })

  it('disables both buttons while the article is being saved', async () => {
    const user = userEvent.setup()
    let finishSaving
    const onSubmit = vi.fn(() => new Promise((resolve) => (finishSaving = resolve)))
    render(<ArticleForm initialValues={VALID} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(screen.getByRole('button', { name: 'Publishing...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Draft' })).toBeDisabled()

    finishSaving()
    expect(await screen.findByRole('button', { name: 'Publish' })).toBeEnabled()
  })
})
