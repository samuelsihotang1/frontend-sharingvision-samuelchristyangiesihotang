import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'

/** Dotted canvas with one floating white "window" holding the nav and the current page. */
export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-dot-grid px-2 py-2 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1200px] rounded-[20px] bg-white shadow-window ring-1 ring-line/60">
        <TopNav />
        <main className="px-4 pt-4 pb-12 sm:px-10 lg:px-16">
          <Outlet />
        </main>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Sharing Vision &middot; Frontend test 2023
      </p>
    </div>
  )
}
