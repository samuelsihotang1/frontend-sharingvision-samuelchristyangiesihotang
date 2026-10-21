import { describe, expect, it } from 'vitest'
import { charCount, validateArticle } from './validation'

const validArticle = {
  title: 'A title that is long enough',
  content: 'x'.repeat(200),
  category: 'Tech',
  status: 'publish',
}

describe('validateArticle', () => {
  it('accepts a valid article', () => {
    expect(validateArticle(validArticle)).toEqual({})
  })

  it('accepts every status the API knows, including "thrash"', () => {
    for (const status of ['publish', 'draft', 'thrash']) {
      expect(validateArticle({ ...validArticle, status })).toEqual({})
    }
  })

  it('reports every missing field as required', () => {
    expect(validateArticle({ title: '', content: '', category: '', status: '' })).toEqual({
      title: 'Title is required',
      content: 'Content is required',
      category: 'Category is required',
      status: 'Status is required',
    })
  })

  it('treats missing (undefined) fields as empty', () => {
    expect(validateArticle({ status: 'draft' })).toMatchObject({
      title: 'Title is required',
      content: 'Content is required',
      category: 'Category is required',
    })
  })

  it('enforces the minimum lengths', () => {
    const errors = validateArticle({
      title: 'x'.repeat(19),
      content: 'x'.repeat(199),
      category: 'ab',
      status: 'draft',
    })
    expect(errors).toEqual({
      title: 'Title must be at least 20 characters',
      content: 'Content must be at least 200 characters',
      category: 'Category must be at least 3 characters',
    })
  })

  it('accepts values exactly at the minimum length', () => {
    const errors = validateArticle({
      title: 'x'.repeat(20),
      content: 'x'.repeat(200),
      category: 'abc',
      status: 'draft',
    })
    expect(errors).toEqual({})
  })

  it('does not count surrounding whitespace', () => {
    const errors = validateArticle({ ...validArticle, title: `   ${'x'.repeat(19)}   `, category: '  ab  ' })
    expect(errors.title).toBe('Title must be at least 20 characters')
    expect(errors.category).toBe('Category must be at least 3 characters')
    expect(validateArticle({ ...validArticle, category: '   ' }).category).toBe('Category is required')
  })

  it('rejects an unknown status', () => {
    expect(validateArticle({ ...validArticle, status: 'trash' }).status).toBe(
      'Status must be one of: publish, draft, thrash',
    )
  })
})

describe('charCount', () => {
  it('counts characters after trimming', () => {
    expect(charCount('  hello  ')).toBe(5)
    expect(charCount(undefined)).toBe(0)
  })

  it('counts an emoji as one character, like the Go backend counts runes', () => {
    expect(charCount('ab😀')).toBe(3)
  })
})
