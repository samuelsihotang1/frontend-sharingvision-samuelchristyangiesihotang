import { RotateCw, TriangleAlert } from 'lucide-react'
import Button from './Button'
import EmptyState from './EmptyState'

/** Shown when a request fails; offers a retry. */
export default function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description={error?.message ?? 'The request failed.'}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RotateCw size={15} aria-hidden="true" />
            Try again
          </Button>
        )
      }
    />
  )
}
