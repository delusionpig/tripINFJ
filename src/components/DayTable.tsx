import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isUrl, mergeNext, split, timeLabel, type Block } from '../lib/plan'

type Props = { blocks: Block[]; date: string; readOnly: boolean; onChange: (blocks: Block[]) => void }
type EmptyGroup = { start: number; end: number; key: string }

const hasContent = (b: Block) => Boolean(b.event.trim() || b.link.trim() || b.note.trim() || b.places.length)
const pad = (n: number) => String(n).padStart(2, '0')

function emptyGroups(blocks: Block[]): EmptyGroup[] {
  const groups: EmptyGroup[] = []
  let start = -1
  for (let i = 0; i <= blocks.length; i += 1) {
    const empty = i < blocks.length && !hasContent(blocks[i])
    if (empty && start < 0) start = i
    if (!empty && start >= 0) {
      groups.push({ start, end: i - 1, key: `${blocks[start].id}-${blocks[i - 1].id}` })
      start = -1
    }
  }
  return groups
}

function groupLabel(blocks: Block[], group: EmptyGroup) {
  const from = blocks.slice(0, group.start).reduce((sum, b) => sum + b.span, 0)
  const hours = blocks.slice(group.start, group.end + 1).reduce((sum, b) => sum + b.span, 0)
  return `${pad(from)}:00–${pad(from + hours)}:00`
}

export default function DayTable({ blocks, date, readOnly, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const location = useLocation()
  const detailBase = location.pathname.startsWith('/bangkok') ? '/bangkok/day' : '/day'
  const groups = emptyGroups(blocks)
  const groupFor = (i: number) => groups.find((group) => group.start <= i && i <= group.end)
  const edit = (i: number, patch: Partial<Block>) =>
    onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)))
  const toggle = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  const allCollapsed = groups.length > 0 && groups.every((group) => collapsed.has(group.key))
  const toggleAll = () => setCollapsed(allCollapsed ? new Set() : new Set(groups.map((group) => group.key)))

  return (
    <div className="table-wrap">
      <table className="day-table">
        <thead>
          <tr>
            <th>
              <div className="time-heading">
                <span>时间</span>
                {groups.length > 0 && (
                  <button type="button" className="mini" onClick={toggleAll} aria-expanded={!allCollapsed}>
                    {allCollapsed ? '展开空白时段' : '收起空白时段'}
                  </button>
                )}
              </div>
            </th>
            <th>事件</th>
            <th>链接</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {blocks.flatMap((b, i) => {
            const group = groupFor(i)
            if (group && collapsed.has(group.key)) {
              if (i !== group.start) return []
              return (
                <tr key={group.key} className="collapsed-row">
                  <td colSpan={4}>
                    <div className="collapsed-time">
                      <span>{groupLabel(blocks, group)}</span>
                      <button type="button" className="mini" onClick={() => toggle(group.key)} aria-expanded="false">
                        展开空白时段
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }

            const label = timeLabel(blocks, i)
            const detail = `${detailBase}/${date}/${encodeURIComponent(b.id)}`
            const rows = [
              <tr key={b.id}>
                <td rowSpan={b.span} className="time-cell">
                  <div>{label}</div>
                  <div className="cell-actions">
                    {!readOnly && (
                      <>
                        {i < blocks.length - 1 && (
                          <button type="button" className="mini" onClick={() => onChange(mergeNext(blocks, i))}>
                            合并下一格
                          </button>
                        )}
                        {b.span > 1 && (
                          <button type="button" className="mini" onClick={() => onChange(split(blocks, i))}>
                            拆分
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td rowSpan={b.span}>
                  {readOnly ? (
                    b.event && (
                      <Link to={detail} className="cell-link" aria-label={`${label} ${b.event}，查看详情`}>
                        {b.event}
                        {b.places.length > 0 && <small className="badge">{b.places.length} 个详情</small>}
                      </Link>
                    )
                  ) : (
                    <>
                      <textarea
                        rows={b.span}
                        aria-label={`${label} 事件`}
                        placeholder="编辑事件文字"
                        value={b.event}
                        onChange={(e) => edit(i, { event: e.target.value })}
                      />
                      {b.event.trim() && (
                        <Link to={detail} className="detail-link">
                          打开详情{b.places.length > 0 ? `（${b.places.length} 个详情）` : ''} →
                        </Link>
                      )}
                    </>
                  )}
                </td>
                <td rowSpan={b.span}>
                  {readOnly ? (
                    isUrl(b.link) ? (
                      <a href={b.link.trim()} target="_blank" rel="noopener noreferrer" className="cell-text">
                        打开链接
                      </a>
                    ) : (
                      <span className="cell-text">{b.link}</span>
                    )
                  ) : (
                    <>
                      <input
                        type="text"
                        inputMode="url"
                        aria-label={`${label} 链接`}
                        value={b.link}
                        onChange={(e) => edit(i, { link: e.target.value })}
                      />
                      {isUrl(b.link) && (
                        <a href={b.link.trim()} target="_blank" rel="noopener noreferrer">
                          打开
                        </a>
                      )}
                    </>
                  )}
                </td>
                <td rowSpan={b.span}>
                  {readOnly ? (
                    <span className="cell-text">{b.note}</span>
                  ) : (
                    <textarea
                      rows={b.span}
                      aria-label={`${label} 备注`}
                      value={b.note}
                      onChange={(e) => edit(i, { note: e.target.value })}
                    />
                  )}
                </td>
              </tr>,
            ]
            // Rows covered by the rowSpan above still need to exist.
            for (let k = 1; k < b.span; k++) rows.push(<tr key={`${b.id}-${k}`} />)
            return rows
          })}
        </tbody>
      </table>
    </div>
  )
}
