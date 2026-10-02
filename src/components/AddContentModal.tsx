import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Field, Spinner } from './ui'
import { useAuth } from '../context/AuthContext'
import { createContent } from '../lib/contentService'
import { todayKey } from '../lib/date'
import { TEMPLATES } from '../lib/templates'
import {
  PILLARS,
  PLATFORMS,
  PRIORITIES,
  CONTENT_TYPES,
  TEMPLATE_KEYS,
  type ContentPillar,
  type ContentType,
  type NewContentInput,
  type Platform,
  type Priority,
  type TemplateKey,
} from '../types/content'

const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  Reel: 'REEL — Hook / Problem / Insight / Solution / CTA',
  Carousel: 'CAROUSEL — 7 slides (Hook → CTA)',
  'Static Post': 'STATIC POST — Message / Proof / Format',
  Story: 'STORY — 3 frame arc + CTA',
  'YouTube Video': 'YOUTUBE — Cold open / Sections / Outro',
}

/** Turns a Firestore failure into something the user can act on. */
function describeCreateError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code
  switch (code) {
    case 'permission-denied':
      return 'Firestore rejected this write — your account is not allowed to create content.'
    case 'unavailable':
      return 'Could not reach Firestore. Check your connection and try again.'
    case 'deadline-exceeded':
      return 'Firestore took too long to respond. Please try again.'
    case 'failed-precondition':
      return 'Firestore is not ready yet. Please try again in a moment.'
    default:
      break
  }
  const message = err instanceof Error ? err.message : ''
  return message || 'Could not create content. Please try again.'
}

type FormState = {
  title: string
  type: ContentType
  platform: Platform
  publishDate: string
  pillar: ContentPillar
  priority: Priority
  hook: string
  cta: string
  template: TemplateKey | null
}

function initialForm(defaultDate?: string): FormState {
  return {
    title: '',
    type: 'Reel',
    platform: 'Instagram',
    publishDate: defaultDate || todayKey(),
    pillar: 'Education',
    priority: 'Medium',
    hook: '',
    cta: '',
    template: null,
  }
}

export default function AddContentModal({
  open,
  onClose,
  onCreated,
  defaultDate,
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: string) => void
  defaultDate?: string
}) {
  const { profile } = useAuth()
  const [form, setForm] = useState<FormState>(() => initialForm(defaultDate))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Guards against a second submit before React has re-rendered the disabled button.
  const submitting = useRef(false)

  useEffect(() => {
    if (open) {
      setForm(initialForm(defaultDate))
      setError(null)
      // Opening always starts a clean session, even if the previous create was
      // still in flight when the modal was closed.
      submitting.current = false
      setSaving(false)
    }
  }, [open, defaultDate])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const preview = useMemo(() => {
    if (!form.template) return null
    const built = TEMPLATES[form.template]()
    const parts: string[] = []
    if (built.idea) parts.push('Idea')
    if (form.template === 'Carousel') parts.push('Slides 1–7')
    else if (built.script) parts.push('Script')
    if (built.caption) parts.push('Caption')
    if (built.hashtags) parts.push('Hashtags')
    return parts
  }, [form.template])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Give the content a title first.')
      return
    }
    if (!form.publishDate) {
      setError('Pick a publish date.')
      return
    }
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError(null)
    const payload: NewContentInput = {
      title: form.title.trim(),
      type: form.type,
      platform: form.platform,
      publishDate: form.publishDate,
      pillar: form.pillar,
      priority: form.priority,
      hook: form.hook.trim(),
      cta: form.cta.trim(),
      template: form.template,
    }
    try {
      const id = await createContent(
        payload,
        { uid: profile?.uid ?? '', name: profile?.name ?? 'Team Member' },
      )
      onCreated(id)
    } catch (err) {
      setError(describeCreateError(err))
    } finally {
      // Both paths must clear the button: the modal is closed by the parent on
      // success, but this component stays mounted across open/close cycles.
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Content"
      subtitle="A title, a date and a type is all you need — you can write the rest in the workspace."
      width="max-w-3xl"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="add-content-form" className="btn-primary" disabled={saving}>
            {saving ? <Spinner /> : null}
            {saving ? 'Creating…' : 'Create content'}
          </button>
        </>
      }
    >
      <form id="add-content-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Content Title">
            <input
              className="input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="3 Meta Ads Mistakes"
              data-autofocus
            />
          </Field>
        </div>

        <Field label="Content Type">
          <select
            className="input"
            value={form.type}
            onChange={(e) => set('type', e.target.value as ContentType)}
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Publish Date">
          <input
            type="date"
            className="input"
            value={form.publishDate}
            onChange={(e) => set('publishDate', e.target.value)}
          />
        </Field>

        <Field label="Platform">
          <select
            className="input"
            value={form.platform}
            onChange={(e) => set('platform', e.target.value as Platform)}
          >
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Content Pillar">
          <select
            className="input"
            value={form.pillar}
            onChange={(e) => set('pillar', e.target.value as ContentPillar)}
          >
            {PILLARS.map((pillar) => (
              <option key={pillar} value={pillar}>
                {pillar}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority">
          <select
            className="input"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as Priority)}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Hook" hint="Optional — you can write the full hook inside the workspace.">
            <input
              className="input"
              value={form.hook}
              onChange={(e) => set('hook', e.target.value)}
              placeholder="Stop wasting ad spend on these 3 mistakes…"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="CTA" hint="Optional">
            <input
              className="input"
              value={form.cta}
              onChange={(e) => set('cta', e.target.value)}
              placeholder="Save this for your next campaign."
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Template"
            hint="Templates pre-fill the structure of the workspace so you can fill in the blanks."
          >
            <select
              className="input"
              value={form.template ?? ''}
              onChange={(e) => {
                const value = e.target.value
                if (!value) {
                  setForm((c) => ({ ...c, template: null }))
                  return
                }
                const template = value as TemplateKey
                setForm((c) => ({ ...c, template, type: template }))
              }}
            >
              <option value="">No template — start blank</option>
              {TEMPLATE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {TEMPLATE_LABELS[key]}
                </option>
              ))}
            </select>
          </Field>
          {preview && preview.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                Will populate
              </span>
              {preview.map((part) => (
                <span
                  key={part}
                  className="rounded-md bg-ationic-yellow/20 px-2 py-0.5 text-[11px] font-semibold text-yellow-900 dark:text-ationic-yellow"
                >
                  {part}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}