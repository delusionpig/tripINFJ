import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { uploadImage } from '../lib/images'
import { usePlan } from '../lib/PlanContext'
import { isUrl, newPlace, timeLabel, type Block, type Place } from '../lib/plan'

type PlaceCardProps = {
  place: Place
  readOnly: boolean
  startEditing?: boolean
  onChange: (p: Place) => void
  onRemove: () => void
}

function PlaceCard({ place, readOnly, startEditing = false, onChange, onRemove }: PlaceCardProps) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [isEditing, setIsEditing] = useState(startEditing)
  const set = (patch: Partial<Place>) => onChange({ ...place, ...patch })

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setErr('')
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage))
      set({ images: [...place.images, ...urls] })
    } catch {
      setErr('图片上传失败，请检查网络或存储桶是否已创建')
    } finally {
      setBusy(false)
    }
  }

  const images = place.images.map((src, i) => (
    <figure key={src} className="thumb">
      <img
        src={src}
        alt={`${place.name || '详情'} 图片 ${i + 1}`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.hidden = true
          event.currentTarget.parentElement?.classList.add('thumb-unavailable')
        }}
      />
      {isEditing && (
        <button
          type="button"
          className="mini"
          aria-label={`删除图片 ${i + 1}`}
          onClick={() => set({ images: place.images.filter((_, j) => j !== i) })}
        >
          删除
        </button>
      )}
    </figure>
  ))

  if (readOnly || !isEditing) {
    return (
      <article className="card place">
        <div className="place-title-row">
          <h2>{place.name || '未命名详情'}</h2>
          {!readOnly && (
            <div className="place-actions">
              <button type="button" className="mini" onClick={() => setIsEditing(true)}>
                编辑
              </button>
              <button type="button" className="mini danger-mini" onClick={onRemove}>
                删除
              </button>
            </div>
          )}
        </div>
        {place.address && (
          <p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {place.address}
            </a>
          </p>
        )}
        {isUrl(place.link) && (
          <p>
            <a href={place.link.trim()} target="_blank" rel="noopener noreferrer">
              打开链接
            </a>
          </p>
        )}
        {place.note && <p className="cell-text">{place.note}</p>}
        {images.length > 0 && <div className="thumbs">{images}</div>}
      </article>
    )
  }

  return (
    <article className="card place">
      <div className="form">
        <label>
          名称
          <input type="text" value={place.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label>
          地址
          <input type="text" value={place.address} onChange={(e) => set({ address: e.target.value })} />
        </label>
        <label>
          链接
          <input type="text" inputMode="url" value={place.link} onChange={(e) => set({ link: e.target.value })} />
        </label>
        <label>
          备注
          <textarea rows={3} value={place.note} onChange={(e) => set({ note: e.target.value })} />
        </label>
        <label>
          图片
          <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => upload(e.target.files)} />
        </label>
        {busy && <span className="muted" role="status">上传中…</span>}
        {err && <p className="error" role="alert">{err}</p>}
        {images.length > 0 && <div className="thumbs">{images}</div>}
        <div className="place-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>
            完成
          </button>
          <button type="button" className="mini danger-mini" onClick={onRemove}>
            删除此详情
          </button>
        </div>
      </div>
    </article>
  )
}

export default function DetailPage() {
  const { date = '', id = '' } = useParams()
  const location = useLocation()
  const planPath = location.pathname.startsWith('/bangkok') ? '/bangkok' : '/plan'
  const { plan, update, editing } = usePlan()
  const blocks = plan?.days[date]
  const i = blocks?.findIndex((b) => b.id === id) ?? -1

  if (!plan || !blocks || i < 0) {
    return (
      <section>
        <p className="muted">找不到这个时间段，可能已被合并或删除。</p>
        <Link to={planPath} className="btn btn-ghost">返回行程</Link>
      </section>
    )
  }

  const block = blocks[i]
  const setBlock = (patch: Partial<Block>) =>
    update({ ...plan, days: { ...plan.days, [date]: blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)) } })
  const setPlace = (k: number, p: Place) => setBlock({ places: block.places.map((x, j) => (j === k ? p : x)) })

  return (
    <section>
      <div className="row">
        <Link to={planPath} className="btn btn-ghost">← 返回行程</Link>
        <span className="muted">{date} {timeLabel(blocks, i)}</span>
      </div>
      <h1>{block.event || '未命名事件'}</h1>
      {block.note && <p className="cell-text">{block.note}</p>}

      <div className="row detail-head">
        <h2>详情（{block.places.length}）</h2>
        {editing && (
          <button type="button" className="btn" onClick={() => setBlock({ places: [...block.places, newPlace()] })}>
            ＋ 添加详情
          </button>
        )}
      </div>
      {block.places.length === 0 && (
        <p className="muted">{editing ? '还没有详情，点击右上角“添加详情”开始。' : '还没有详情。切换到编辑模式可以添加。'}</p>
      )}
      <div className="place-list">
        {block.places.map((p, k) => (
          <PlaceCard
            key={p.id}
            place={p}
            readOnly={!editing}
            startEditing={false}
            onChange={(next) => setPlace(k, next)}
            onRemove={() => setBlock({ places: block.places.filter((_, j) => j !== k) })}
          />
        ))}
      </div>
    </section>
  )
}
