import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTrips } from '../lib/trips'
import type { Trip } from '../lib/types'

export default function TripListPage() {
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listTrips()
      .then(setTrips)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <section>
      <div className="row">
        <h1>我的旅行</h1>
        <Link to="/trips/new" className="btn">
          新建旅行
        </Link>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      {!trips && !error && <p className="muted">加载中…</p>}
      {trips?.length === 0 && <p className="muted">还没有旅行计划，点击“新建旅行”开始。</p>}
      <ul className="trip-list">
        {trips?.map((t) => (
          <li key={t.id}>
            <Link to={`/trips/${t.id}`} className="card trip-card">
              <strong>{t.title}</strong>
              <span className="muted">{t.destination || '未设置目的地'}</span>
              <span className="muted">
                {t.start_date ?? '日期待定'}
                {t.end_date ? ` → ${t.end_date}` : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
