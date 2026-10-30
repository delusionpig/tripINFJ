import { useEffect, useState } from 'react'
import DayTable from '../components/DayTable'
import RangeCalendar from '../components/RangeCalendar'
import { fetchPlan, pushPlan } from '../lib/remote'
import { buildPlan, dateRange, loadPlan, savePlan, type Block, type Plan } from '../lib/plan'

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(loadPlan)
  const [editing, setEditing] = useState(false)
  const [active, setActive] = useState(0)
  const [sync, setSync] = useState<'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [ready, setReady] = useState(false)

  // Cloud is the source of truth once it loads; until then (or if it fails) local data is used.
  useEffect(() => {
    fetchPlan()
      .then((remote) => {
        if (remote) setPlan(remote)
        setReady(true)
        setSync('saved')
      })
      .catch(() => setSync('error'))
  }, [])

  // Never push before the first fetch succeeds, so a failed load cannot overwrite cloud data.
  useEffect(() => {
    if (!plan) return
    savePlan(plan)
    if (!ready) return
    setSync('saving')
    const t = setTimeout(() => {
      pushPlan(plan)
        .then(() => setSync('saved'))
        .catch(() => setSync('error'))
    }, 800)
    return () => clearTimeout(t)
  }, [plan, ready])

  if (!plan && sync === 'loading') return <p className="muted">加载中…</p>

  if (!plan || editing) {
    return (
      <RangeCalendar
        initialStart={plan?.start}
        initialEnd={plan?.end}
        onCancel={plan ? () => setEditing(false) : undefined}
        onConfirm={(s, e) => {
          setPlan(buildPlan(s, e, plan ?? undefined))
          setActive(0)
          setEditing(false)
        }}
      />
    )
  }

  const dates = dateRange(plan.start, plan.end)
  const date = dates[Math.min(active, dates.length - 1)]
  const setBlocks = (blocks: Block[]) => setPlan({ ...plan, days: { ...plan.days, [date]: blocks } })

  return (
    <section>
      <div className="row">
        <h1>
          {plan.start} → {plan.end}
        </h1>
        <span className={sync === 'error' ? 'error' : 'muted'} role="status">
          {{ loading: '同步中…', saving: '保存中…', saved: '已同步到云端', error: '云端同步失败，仅保存在本地' }[sync]}
        </span>
        <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
          重新选择日期
        </button>
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
        <DayTable blocks={plan.days[date]} onChange={setBlocks} />
      </div>
    </section>
  )
}
