import { useLocation } from 'react-router-dom'

/** Prints the current URL so tests can assert on navigation and query strings. */
export default function LocationProbe() {
  const { pathname, search } = useLocation()
  return <output data-testid="location">{pathname + search}</output>
}
