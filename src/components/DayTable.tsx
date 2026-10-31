import { Link } from 'react-router-dom'
import { isUrl, mergeNext, split, timeLabel, type Block } from '../lib/plan'

type Props = { blocks: Block[]; date: string; readOnly: boolean; onChange: (blocks: Block[]) => void }

export default function DayTable({ blocks, date, readOnly, onChange }: Props) {
  const edit = (i: number, patch: Partial<Block>) =>
    onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)))

  return (
    <div className="table-wrap">
      <table className="day-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>事件</th>
            <th>链接</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {blocks.flatMap((b, i) => {
            const label = timeLabel(blocks, i)
            const detail = `/day/${date}/${encodeURIComponent(b.id)}`
            const rows = [
              <tr key={b.id}>
                <td rowSpan={b.span} className="time-cell">
                  <div>{label}</div>
                  {!readOnly && (
                    <div className="cell-actions">
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
                    </div>
                  )}
                </td>
                <td rowSpan={b.span}>
                  {readOnly ? (
                    b.event && (
                      <Link to={detail} className="cell-link" aria-label={`${label} ${b.event}，查看详情`}>
                        {b.event}
                        {b.places.length > 0 && <small className="badge">{b.places.length} 个备选</small>}
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
                          打开详情{b.places.length > 0 ? `（${b.places.length} 个备选）` : ''} →
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
