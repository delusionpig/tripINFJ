import { mergeNext, split, type Block } from '../lib/plan'

const pad = (n: number) => String(n).padStart(2, '0')
const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s.trim())

type Props = { blocks: Block[]; onChange: (blocks: Block[]) => void }

export default function DayTable({ blocks, onChange }: Props) {
  let hour = 0
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
            const from = hour
            hour += b.span
            const label = `${pad(from)}:00–${pad(from + b.span)}:00`
            const rows = [
              <tr key={i}>
                <td rowSpan={b.span} className="time-cell">
                  <div>{label}</div>
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
                </td>
                <td rowSpan={b.span}>
                  <textarea
                    rows={b.span}
                    aria-label={`${label} 事件`}
                    value={b.event}
                    onChange={(e) => edit(i, { event: e.target.value })}
                  />
                </td>
                <td rowSpan={b.span}>
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
                </td>
                <td rowSpan={b.span}>
                  <textarea
                    rows={b.span}
                    aria-label={`${label} 备注`}
                    value={b.note}
                    onChange={(e) => edit(i, { note: e.target.value })}
                  />
                </td>
              </tr>,
            ]
            // Rows covered by the rowSpan above still need to exist.
            for (let k = 1; k < b.span; k++) rows.push(<tr key={`${i}-${k}`} />)
            return rows
          })}
        </tbody>
      </table>
    </div>
  )
}
