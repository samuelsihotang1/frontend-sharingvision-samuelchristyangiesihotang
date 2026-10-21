import { useState } from 'react'
import { STATUS } from '../../lib/articleStatus'
import { MIN_LENGTH, charCount, validateArticle } from '../../lib/validation'
import Button from '../ui/Button'

const EMPTY_ARTICLE = { title: '', content: '', category: '' }

/**
 * Title / Content / Category form shared by "Add New" and "Edit".
 * "Publish" and "Draft" validate the fields, then call onSubmit(article) with
 * status "publish" or "draft". If onSubmit throws an ApiError, its field
 * errors (HTTP 422) are shown under the matching fields.
 */
export default function ArticleForm({ initialValues = EMPTY_ARTICLE, onSubmit }) {
  const [values, setValues] = useState({
    title: initialValues.title ?? '',
    content: initialValues.content ?? '',
    category: initialValues.category ?? '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [savingStatus, setSavingStatus] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))

    // A field that already shows an error is re-checked while the user types.
    if (errors[name]) {
      const next = validateArticle({ ...values, [name]: value, status: STATUS.DRAFT })
      setErrors((previous) => ({ ...previous, [name]: next[name] }))
    }
  }

  async function save(status) {
    const article = {
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category.trim(),
      status,
    }

    const found = validateArticle(article)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setSavingStatus(status)
    try {
      await onSubmit(article)
    } catch (error) {
      setErrors(error.fieldErrors ?? {})
      setFormError(error.message)
    } finally {
      setSavingStatus(null)
    }
  }

  const saving = savingStatus !== null

  return (
    <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
      <Field
        name="title"
        label="Title"
        value={values.title}
        error={errors.title}
        onChange={handleChange}
        placeholder="A clear, descriptive title"
      />
      <Field
        name="content"
        label="Content"
        multiline
        value={values.content}
        error={errors.content}
        onChange={handleChange}
        placeholder="Write the article..."
      />
      <Field
        name="category"
        label="Category"
        value={values.category}
        error={errors.category}
        onChange={handleChange}
        placeholder="e.g. Technology"
      />

      {(formError || errors.status) && (
        <p role="alert" className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
          {errors.status ?? formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => save(STATUS.DRAFT)} disabled={saving}>
          {savingStatus === STATUS.DRAFT ? 'Saving...' : 'Draft'}
        </Button>
        <Button onClick={() => save(STATUS.PUBLISH)} disabled={saving}>
          {savingStatus === STATUS.PUBLISH ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}

const INPUT =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 ' +
  'transition-shadow duration-150 focus:outline-none focus:ring-4 focus:ring-accent/15'

/** Labelled input or textarea with a character counter and an error message. */
function Field({ name, label, value, error, onChange, placeholder, multiline = false }) {
  const id = `article-${name}`
  const min = MIN_LENGTH[name]
  const count = charCount(value)
  const Control = multiline ? 'textarea' : 'input'

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className={`text-xs tabular-nums ${count >= min ? 'text-success-ink' : 'text-muted'}`}>
          {count} / {min} min
        </span>
      </div>
      <Control
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? 10 : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT} ${multiline ? 'resize-y leading-relaxed' : ''} ${
          error ? 'border-danger/60 focus:border-danger' : 'border-line focus:border-accent'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
