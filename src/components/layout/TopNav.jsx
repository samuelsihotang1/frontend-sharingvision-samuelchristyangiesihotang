import { Menu, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'
import BrandMark from './BrandMark'

const NAV_ITEMS = [
  // The edit page belongs to "All Posts", the article detail page to "Preview".
  { to: '/', label: 'All Posts', isActive: (path) => path === '/' || path.startsWith('/edit/') },
  { to: '/add', label: 'Add New', isActive: (path) => path === '/add' },
  { to: '/preview', label: 'Preview', isActive: (path) => path.startsWith('/preview') },
]

/** Top navigation inside the app window: brand, links, primary action; a dropdown on mobile. */
export default function TopNav() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="relative flex items-center justify-between gap-4 px-4 py-4 sm:px-10 lg:px-16">
      <BrandMark />

      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                active ? 'bg-subtle text-ink' : 'text-ink/65 hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block">
        <Button to="/add">
          <Plus size={16} aria-hidden="true" />
          New Article
        </Button>
      </div>

      <button
        type="button"
        className="grid size-10 place-items-center rounded-lg bg-subtle text-ink md:hidden"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-3 top-full z-30 animate-enter rounded-2xl border border-line bg-white p-2 shadow-window md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2.5 text-sm ${active ? 'bg-subtle text-ink' : 'text-ink/70'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <Button to="/add" onClick={closeMenu} className="mt-2 w-full">
            <Plus size={16} aria-hidden="true" />
            New Article
          </Button>
        </div>
      )}
    </header>
  )
}
