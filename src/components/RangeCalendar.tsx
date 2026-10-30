import { useState } from 'react'
import { dateRange } from '../lib/plan'

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const WEEK = ['日', '一', '二', '三', '四', '五', '六']

type Props = {
  initialStart?: string
  initialEnd?: string
  onConfirm: (start: string, end: string) => void
  onCancel?: () => void
}

export default function RangeCalendar({ initialStart, initialEnd, onConfirm, onCancel }: Props) {
  const [start, setStart] = useState(initialStart ?? '')
  const [end, setEnd] = useState(initialEnd ?? '')
  const [view, setView] = useState(() => {
    const base = initialStart ? new Date(`${initialStart}T00:00:00`) : new Date()
    return { y: base.getFullYear(), m: base.getMonth() }
  })

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  // First click sets start; second click sets end (swapped if earlier); a third click starts over.
  function pick(d: string) {
    if (!start || end) {
      setStart(d)
      setEnd('')
    } else if (d < start) {
      setEnd(start)
      setStart(d)
    } else {
      setEnd(d)
    }
  }

  const lead = new Date(view.y, view.m, 1).getDay()
  const count = new Date(view.y, view.m + 1, 0).getDate()
  const days = start && end ? dateRange(start, end).length : 0

  return (
    <section className="card calendar">
      <h1>选择出行日期</h1>
      <div className="row">
        <button type="button" className="btn btn-ghost" aria-label="上个月" onClick={() => shift(-1)}>
          ‹
        </button>
        <strong aria-live="polite">
          {view.y} 年 {view.m + 1} 月
        </strong>
        <button type="button" className="btn btn-ghost" aria-label="下个月" onClick={() => shift(1)}>
          ›
        </button>
      </div>
      <div className="cal-grid">
        {WEEK.map((w) => (
          <span key={w} className="cal-week" aria-hidden="true">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`b${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const d = fmt(view.y, view.m, i + 1)
          const edge = d === start || d === end
          const inside = start && end && d > start && d < end
          return (
            <button
              key={d}
              type="button"
              aria-label={d}
              aria-pressed={edge}
              className={`cal-day${edge ? ' edge' : ''}${inside ? ' inside' : ''}`}
              onClick={() => pick(d)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <p className="muted" role="status">
        {days ? `${start} → ${end}，共 ${days} 天` : start ? `开始：${start}，请选择结束日期` : '请先选择开始日期'}
      </p>
      <div className="row">
        {onCancel ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            取消
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn" disabled={!days} onClick={() => onConfirm(start, end)}>
          生成行程
        </button>
      </div>
    </section>
  )
}
