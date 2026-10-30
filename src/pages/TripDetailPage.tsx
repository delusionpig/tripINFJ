import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createTrip, getTrip, updateTrip } from '../lib/trips'
import type { TripInput } from '../lib/types'

const empty = { title: '', destination: '', start_date: '', end_date: '', notes: '' }

export default function TripDetailPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!isNew)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew || !id) return
    getTrip(id)
      .then((t) =>
        setForm({
          title: t.title,
          destination: t.destination,
          start_date: t.start_date ?? '',
          end_date: t.end_date ?? '',
          notes: t.notes,
        }),
      )
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isNew])

  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const input: TripInput = {
      ...form,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }
    try {
      if (isNew) await createTrip(input)
      else await updateTrip(id!, input)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  if (loading) return <p className="muted">加载中…</p>

  return (
    <section>
      <div className="row">
        <h1>{isNew ? '新建旅行' : '编辑旅行'}</h1>
        <Link to="/" className="btn btn-ghost">
          返回
        </Link>
      </div>
      <form className="card form" onSubmit={onSubmit}>
        <label>
          旅行名称
          <input required value={form.title} onChange={set('title')} />
        </label>
        <label>
          目的地
          <input value={form.destination} onChange={set('destination')} />
        </label>
        <div className="row-fields">
          <label>
            出发日期
            <input type="date" value={form.start_date} onChange={set('start_date')} />
          </label>
          <label>
            返回日期
            <input type="date" min={form.start_date || undefined} value={form.end_date} onChange={set('end_date')} />
          </label>
        </div>
        <label>
          备注
          <textarea rows={5} value={form.notes} onChange={set('notes')} />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="btn" disabled={busy}>
          保存
        </button>
      </form>
      {/* Extension point: itinerary days, places, budget and collaboration sections go here. */}
    </section>
  )
}
