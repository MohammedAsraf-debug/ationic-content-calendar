import type { ReactNode, TextareaHTMLAttributes } from 'react'

export function EditorSection({
  title,
  hint,
  children,
  tone = 'default',
}: {
  title: string
  hint?: string
  children: ReactNode
  tone?: 'default' | 'highlight'
}) {
  return (
    <section
      className={`surface p-4 sm:p-5 ${
        tone === 'highlight' ? 'border-l-[3px] border-l-ationic-yellow' : ''
      }`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ationic-ink dark:text-white">
          {title}
        </h2>
        {hint ? <span className="text-[11px] text-zinc-400">{hint}</span> : null}
      </div>
      {children}
    </section>
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
  ...rest
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'placeholder' | 'rows' | 'className'>) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`input resize-y leading-relaxed ${className}`}
      {...rest}
    />
  )
}