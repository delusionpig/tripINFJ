import { useState } from 'react'
import DayTable from '../components/DayTable'
import RangeCalendar from '../components/RangeCalendar'
import { usePlan } from '../lib/PlanContext'
import { buildPlan, dateRange, type Block } from '../lib/plan'

export default function PlanPage() {
  const { plan, update, sync, editing } = usePlan()
  const [picking, setPicking] = useState(false)
  const [active, setActive] = useState(0)

  if (!plan && sync === 'loading') return <p className="muted">加载中…</p>

  if (!plan || (editing && picking)) {
    return (
      <RangeCalendar
        initialStart={plan?.start}
        initialEnd={plan?.end}
        onCancel={plan ? () => setPicking(false) : undefined}
        onConfirm={(s, e) => {
          update(buildPlan(s, e, plan ?? undefined))
          setActive(0)
          setPicking(false)
        }}
      />
    )
  }

  const dates = dateRange(plan.start, plan.end)
  const date = dates[Math.min(active, dates.length - 1)]
  const setBlocks = (blocks: Block[]) => update({ ...plan, days: { ...plan.days, [date]: blocks } })

  return (
    <section>
      <div className="row">
        <h1 className="date-heading">
          <span className="calendar-icon" aria-hidden="true" />
          <span>{plan.start} → {plan.end}</span>
        </h1>
        {editing && (
          <button type="button" className="btn btn-ghost" onClick={() => setPicking(true)}>
            重新选择日期
          </button>
        )}
      </div>
      <div role="tablist" aria-label="行程日期" className="day-tabs">
        {dates.map((d, i) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === date}
            className={`day-tab${d === date ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            第 {i + 1} 天
            <small>{d.slice(5)}</small>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="card">
        <DayTable blocks={plan.days[date]} date={date} readOnly={!editing} onChange={setBlocks} />
      </div>
    </section>
  )
}
