import type { ContentItem } from '../types/content'

const HEADERS = [
  'Title',
  'Type',
  'Platform',
  'Publish Date',
  'Pillar',
  'Priority',
  'Status',
  'Hook',
  'CTA',
  'Hashtags',
  'Updated By',
  'Last Updated',
]

function escapeCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function contentToCsv(items: ContentItem[]): string {
  const rows = items.map((item) =>
    [
      item.title,
      item.type,
      item.platform,
      item.publishDate,
      item.pillar,
      item.priority,
      item.status,
      item.hook,
      item.cta,
      item.hashtags,
      item.updatedByName,
      new Date(item.updatedAt).toISOString(),
    ]
      .map((cell) => escapeCell(String(cell ?? '')))
      .join(','),
  )
  return [HEADERS.join(','), ...rows].join('\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}