import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { coversDates, MAX_PLANS } from '../lib/catalog'
import DayTable from '../components/DayTable'
import RangeCalendar from '../components/RangeCalendar'
import { usePlan } from '../lib/PlanContext'
import { buildPlan, dateRange, type Block } from '../lib/plan'

export default function PlanPage() {
  const { plan, planId, catalog, update, create, remove, sync, editing } = usePlan()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const trip = catalog.find((item) => item.id === planId)
  const [picking, setPicking] = useState(false)
  const [active, setActive] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)
  const deletePlan = () => {
    if (!window.confirm('确定删除此计划？删除后将从目的地列表中移除。')) return
    remove()
    navigate('/')
  }

  if (!plan && sync === 'loading') return <p className="muted">加载中…</p>

  if (!trip) return <section><p>计划已删除或不存在。</p><Link to="/">返回目的地</Link></section>

  if (!plan || (editing && picking)) {
    return (
      <>
      {error && <p className="error" role="alert">{error}</p>}
      <RangeCalendar
        initialStart={plan?.start}
        initialEnd={plan?.end}
        onCancel={() => plan ? setPicking(false) : navigate('/')}
        onConfirm={(s, e) => {
          setError('')
          if (plan && !coversDates(plan, s, e)) {
            if (catalog.filter((item) => item.destination === trip.destination).length >= MAX_PLANS) {
              setError('每个目的地最多 4 个计划，请先删除一个计划。')
              return
            }
            if (!window.confirm('修改日期将新建计划')) return
            try { navigate(`/plans/${create(trip.destination, buildPlan(s, e))}`) }
            catch (error) { setError((error as Error).message) }
            return
          }
          update(buildPlan(s, e, plan ?? undefined))
          setActive(0)
          setPicking(false)
        }}
      />
      {editing && <button type="button" className="btn btn-ghost danger-mini" onClick={deletePlan}>删除计划</button>}
      </>
    )
  }

  const dates = dateRange(plan.start, plan.end)
  const date = dates[Math.min(active, dates.length - 1)]
  const setBlocks = (blocks: Block[]) => update({ ...plan, days: { ...plan.days, [date]: blocks } })
  const download = async () => {
    setExporting(true)
    setExportError(false)
    try {
      const { exportPlan } = await import('../lib/planExcel')
      await exportPlan(plan)
    } catch {
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section>
      <div className="row">
        <h1 className="date-heading">
          <span className="calendar-icon" aria-hidden="true" />
          <span>{plan.start} → {plan.end}</span>
        </h1>
        <div className="plan-actions">
          {editing && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setPicking(true)}>
                重新选择日期
              </button>
              <button type="button" className="btn btn-ghost danger-mini" onClick={deletePlan}>删除计划</button>
            </>
          )}
          <button type="button" className="btn btn-ghost" onClick={download} disabled={exporting}>
            {exporting ? '正在导出…' : '导出 Excel'}
          </button>
        </div>
      </div>
      {exportError && <p className="error" role="alert">Excel 导出失败，请重试。</p>}
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
