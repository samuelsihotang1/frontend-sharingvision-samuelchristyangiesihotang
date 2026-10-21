import { describe, expect, it } from 'vitest'
import { GAP, pageItems, parsePage, totalPages } from './pagination'

describe('pageItems', () => {
  it('lists every page when there are only a few', () => {
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('collapses skipped ranges into gaps around the current page', () => {
    expect(pageItems(6, 10)).toEqual([1, GAP, 5, 6, 7, GAP, 10])
    expect(pageItems(1, 10)).toEqual([1, 2, GAP, 10])
    expect(pageItems(10, 10)).toEqual([1, GAP, 9, 10])
  })

  it('shows a single skipped page as a number instead of a gap', () => {
    expect(pageItems(4, 10)).toEqual([1, 2, 3, 4, 5, GAP, 10])
  })
})

describe('parsePage', () => {
  it('falls back to page 1 for missing or invalid values', () => {
    expect(parsePage(null)).toBe(1)
    expect(parsePage('0')).toBe(1)
    expect(parsePage('-2')).toBe(1)
    expect(parsePage('1.5')).toBe(1)
    expect(parsePage('abc')).toBe(1)
    expect(parsePage('3')).toBe(3)
  })
})

describe('totalPages', () => {
  it('rounds up and never returns less than one page', () => {
    expect(totalPages(0, 10)).toBe(1)
    expect(totalPages(10, 10)).toBe(1)
    expect(totalPages(11, 10)).toBe(2)
  })
})
