import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EditorSection, TextArea } from '../components/Editor'
import { ConfirmDialog } from '../components/Modal'
import ReferencesEditor from '../components/ReferencesEditor'
import StatusPipeline from '../components/StatusPipeline'
import { Avatar, PriorityBadge, Spinner, StatusBadge, TypeBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { useContent } from '../hooks/useContent'
import { useContentDraft } from '../hooks/useContentDraft'
import { deleteContent, duplicateContent, nextDuplicateTitle, updateContent } from '../lib/contentService'
import { formatDateLong, relativeTime } from '../lib/date'
import { CAROUSEL_SLIDE_COUNT } from '../types/content'
import {
  CONTENT_TYPES,
  PILLARS,
  PLATFORMS,
  PRIORITIES,
  STATUSES,
  type ContentItem,
  type ContentPillar,
  type ContentStatus,
  type ContentType,
  type Platform,
  type Priority,
} from '../types/content'

const SAVABLE_FIELDS = [
  'title',
  'type',
  'platform',
  'publishDate',
  'pillar',
  'priority',
  'status',
  'hook',
  'idea',
  'script',
  'caption',
  'cta',
  'hashtags',
  'notes',
  'references',
  'carouselSlides',
] as const satisfies readonly (keyof ContentItem)[]

export default function ContentWorkspacePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { notify } = useUI()
  const { items, byId, loading } = useContent()
  const live = byId.get(id)

  const actor = useMemo(
    () => ({ uid: profile?.uid ?? '', name: profile?.name ?? 'Team Member' }),
    [profile],
  )

  const save = useMemo(
    () =>
      async (contentId: string, patch: Partial<ContentItem>) => {
        await updateContent(contentId, patch, actor)
      },
    [actor],
  )

  const { draft, update, updateNow, state, savedAt } = useContentDraft<ContentItem>(
    live,
    save,
    SAVABLE_FIELDS,
  )

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [working, setWorking] = useState(false)

  const item = draft ?? live

  useEffect(() => {
    if (item) document.title = `${item.title} · Ationic Content Hub`
    return () => {
      document.title = 'Ationic Content Hub'
    }
  }, [item?.title])

  // Deleted from another session.
  useEffect(() => {
    if (!loading && !live && !draft) {
      notify('This content item no longer exists', { tone: 'error' })
      void navigate('/content', { replace: true })
    }
  }, [loading, live, draft, notify, navigate])

  if (!item) {
    return (
      <div className="surface flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Opening workspace…
      </div>
    )
  }

  const lastUpdatedLabel = () => {
    if (state === 'saving') return 'Saving…'
    if (state === 'pending') return 'Unsaved changes'
    if (state === 'error') return 'Could not save — retrying'
    if (savedAt) return `Saved ${relativeTime(savedAt)}`
    return `Last updated ${relativeTime(live?.updatedAt ?? item.updatedAt)}`
  }

  const onDuplicate = async () => {
    setWorking(true)
    try {
      const newId = await duplicateContent(
        item,
        actor,
        items.map((i) => i.title),
      )
      notify('Content duplicated', { tone: 'success' })
      void navigate(`/content/${newId}`)
    } catch (err) {
      notify((err as Error).message || 'Could not duplicate', { tone: 'error' })
    } finally {
      setWorking(false)
    }
  }

  const onDelete = async () => {
    setWorking(true)
    try {
      await deleteContent(item.id)
      setConfirmDelete(false)
      notify('Content deleted', { tone: 'success' })
      void navigate('/content', { replace: true })
    } catch (err) {
      notify((err as Error).message || 'Could not delete', { tone: 'error' })
    } finally {
      setWorking(false)
    }
  }

  const duplicateTitle = nextDuplicateTitle(
    item.title,
    items.map((i) => i.title),
  )

  return (
    <div className="space-y-5 pb-16">
      {/* Breadcrumb + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/calendar"
          className="btn-subtle -ml-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          ← Calendar
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="save-indicator"
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              state === 'error'
                ? 'text-red-600 dark:text-red-400'
                : state === 'saving' || state === 'pending'
                  ? 'text-zinc-500 dark:text-zinc-400'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state === 'error'
                  ? 'bg-red-500'
                  : state === 'saving' || state === 'pending'
                    ? 'animate-pulse bg-zinc-400'
                    : 'bg-emerald-500'
              }`}
            />
            {lastUpdatedLabel()}
          </span>
          <button type="button" onClick={onDuplicate} disabled={working} className="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={working}
            className="btn-ghost text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <input
              value={item.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Content title"
              aria-label="Content title"
              data-testid="content-title"
              className="w-full rounded-lg bg-transparent font-display text-2xl font-bold tracking-tight text-ationic-ink outline-none placeholder:text-zinc-300 sm:text-3xl dark:text-white dark:placeholder:text-zinc-700"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
              <span className="chip bg-transparent px-0 text-zinc-500 ring-0 dark:text-zinc-400">
                {item.platform}
              </span>
              <span className="chip bg-transparent px-0 text-zinc-500 ring-0 dark:text-zinc-400">
                {item.pillar}
              </span>
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 text-sm lg:w-80">
            <div>
              <dt className="field-label">Publish Date</dt>
              <dd className="font-semibold text-ationic-ink dark:text-zinc-100">
                {formatDateLong(item.publishDate)}
              </dd>
            </div>
            <div>
              <dt className="field-label">Last Updated By</dt>
              <dd className="flex items-center gap-2 font-semibold text-ationic-ink dark:text-zinc-100">
                <Avatar
                  initials={(item.updatedByName || 'TM')
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                  name={item.updatedByName}
                />
                <span className="truncate">{item.updatedByName || 'Team Member'}</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Meta controls */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-5 dark:border-white/10">
          <label className="block">
            <span className="field-label">Type</span>
            <select
              className="input"
              value={item.type}
              onChange={(e) => update({ type: e.target.value as ContentType })}
            >
              {CONTENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Publish Date</span>
            <input
              type="date"
              className="input"
              value={item.publishDate}
              onChange={(e) => update({ publishDate: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Platform</span>
            <select
              className="input"
              value={item.platform}
              onChange={(e) => update({ platform: e.target.value as Platform })}
            >
              {PLATFORMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Pillar</span>
            <select
              className="input"
              value={item.pillar}
              onChange={(e) => update({ pillar: e.target.value as ContentPillar })}
            >
              {PILLARS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Priority</span>
            <select
              className="input"
              value={item.priority}
              onChange={(e) => update({ priority: e.target.value as Priority })}
            >
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {/* Pipeline */}
      <section className="surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ationic-ink dark:text-white">
            Production Pipeline
          </h2>
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              Detailed status
            </span>
            <select
              className="input w-48 py-1.5 text-xs"
              value={item.status}
              onChange={(e) => updateNow({ status: e.target.value as ContentStatus })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <StatusPipeline status={item.status} onSelectStage={(status) => updateNow({ status })} />
      </section>

      {/* Editor sections */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <EditorSection title="Content Idea" tone="highlight">
            <TextArea
              value={item.idea}
              onChange={(value) => update({ idea: value })}
              placeholder="What is this content about? The angle, the audience, the outcome…"
              rows={7}
            />
          </EditorSection>

          <EditorSection title="Hook" hint="First 3 seconds / first line">
            <TextArea
              value={item.hook}
              onChange={(value) => update({ hook: value })}
              placeholder="Stop doing X — here's what to do instead."
              rows={4}
            />
          </EditorSection>

          <EditorSection title="Script">
            {item.type === 'Reel' ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                    Hook
                  </p>
                  <TextArea
                    value={item.hook}
                    onChange={(value) => update({ hook: value })}
                    placeholder="Hook — spoken, on camera."
                    rows={3}
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                    Body
                  </p>
                  <TextArea
                    value={item.script}
                    onChange={(value) => update({ script: value })}
                    placeholder="Body — beat by beat."
                    rows={10}
                    className="min-h-[220px]"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                    CTA
                  </p>
                  <TextArea
                    value={item.cta}
                    onChange={(value) => update({ cta: value })}
                    placeholder="CTA — spoken, on camera."
                    rows={3}
                  />
                </div>
              </div>
            ) : item.type === 'Carousel' ? (
              <div className="space-y-2.5">
                {Array.from({ length: CAROUSEL_SLIDE_COUNT }, (_, index) => (
                  <div key={index}>
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                      Slide {index + 1}
                      <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                    </p>
                    <TextArea
                      value={item.carouselSlides[index] ?? ''}
                      onChange={(value) => {
                        const slides = [...item.carouselSlides]
                        slides[index] = value
                        update({ carouselSlides: slides })
                      }}
                      placeholder={`Slide ${index + 1} copy…`}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <TextArea
                value={item.script}
                onChange={(value) => update({ script: value })}
                placeholder={
                  item.type === 'YouTube Video'
                    ? 'Outline: cold open, sections, outro.'
                    : 'Full copy / outline.'
                }
                rows={12}
                className="min-h-[260px]"
              />
            )}
          </EditorSection>

          <EditorSection title="Caption">
            <TextArea
              value={item.caption}
              onChange={(value) => update({ caption: value })}
              placeholder="The caption that goes under the post."
              rows={6}
            />
          </EditorSection>
        </div>

        <div className="space-y-4">
          <EditorSection title="CTA">
            <TextArea
              value={item.cta}
              onChange={(value) => update({ cta: value })}
              placeholder="Save this. Follow for more. DM us 'AUDIT'."
              rows={3}
            />
          </EditorSection>

          <EditorSection title="Hashtags">
            <TextArea
              value={item.hashtags}
              onChange={(value) => update({ hashtags: value })}
              placeholder="#ationic #digitalmarketing"
              rows={3}
              className="font-mono text-xs"
            />
          </EditorSection>

          <EditorSection title="References / Links" hint="Drive files, source posts, inspiration">
            <ReferencesEditor
              references={item.references}
              onChange={(references) => update({ references })}
            />
          </EditorSection>

          <EditorSection title="Notes" hint="Internal — only visible to the team">
            <TextArea
              value={item.notes}
              onChange={(value) => update({ notes: value })}
              placeholder="Feedback, blockers, who is shooting this…"
              rows={8}
              className="min-h-[160px]"
            />
          </EditorSection>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this content?"
        message={
          <>
            <span className="font-semibold text-ationic-ink dark:text-white">{item.title}</span> will be
            permanently removed for both team members. This cannot be undone.
          </>
        }
        confirmLabel="Delete content"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />

      <p className="text-center text-[11px] text-zinc-400">
        Duplicate creates “{duplicateTitle}” · Changes save automatically and sync to both team members
      </p>
    </div>
  )
}