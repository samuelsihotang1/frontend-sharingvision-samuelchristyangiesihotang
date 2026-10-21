import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '../AppRoutes'
import ToastProvider from '../components/toast/ToastProvider'
import LocationProbe from './LocationProbe'

/** Renders the whole app (real routes, layout and toasts) at `path`. */
export function renderApp(path = '/') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AppRoutes />
        <LocationProbe />
      </ToastProvider>
    </MemoryRouter>,
  )
  return { user }
}

/** The URL the app is currently showing, e.g. "/?tab=drafts". */
export function currentLocation() {
  return screen.getByTestId('location').textContent
}
