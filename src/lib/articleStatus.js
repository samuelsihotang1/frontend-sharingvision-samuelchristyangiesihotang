// Article statuses as the backend spells them ("thrash" comes from the test brief).
export const STATUS = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
  THRASH: 'thrash',
}

export const STATUSES = Object.values(STATUS)

// Tabs on the "All Posts" page. `key` is what appears in the URL (?tab=drafts).
export const TABS = [
  { key: 'published', label: 'Published', status: STATUS.PUBLISH },
  { key: 'drafts', label: 'Drafts', status: STATUS.DRAFT },
  { key: 'trashed', label: 'Trashed', status: STATUS.THRASH },
]

export function findTab(key) {
  return TABS.find((tab) => tab.key === key) ?? TABS[0]
}

export function tabKeyForStatus(status) {
  return (TABS.find((tab) => tab.status === status) ?? TABS[0]).key
}
