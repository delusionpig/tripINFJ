import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePlan } from '../lib/PlanContext'
import { MAX_PLANS, type Destination } from '../lib/catalog'

const destinations = [
  {
    id: 'japan',
    name: '日本',
    city: '东京',
    image: 'https://images.unsplash.com/photo-1599173704727-28abef7425e1?auto=format&fit=crop&w=1600&q=85',
    imageAlt: '东京城市夜景',
  },
  {
    id: 'thailand',
    name: '泰国',
    city: '曼谷',
    image: 'https://images.unsplash.com/photo-1558847345-289a92f80ddb?auto=format&fit=crop&w=1600&q=85',
    imageAlt: '曼谷湄南河沿岸城市景色',
  },
]

export default function DestinationPage() {
  const navigate = useNavigate()
  const { catalog, create } = usePlan()
  const [error, setError] = useState('')
  const add = (destination: Destination) => {
    try {
      const id = create(destination)
      navigate(`/plans/${id}`)
    } catch (error) { setError((error as Error).message) }
  }
  return (
    <section className="destination-page">
      <header className="destination-heading">
        <p className="eyebrow">TRAVEL PLANS</p>
        <h1>选择目的地</h1>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="destination-grid" aria-label="旅行目的地">
        {destinations.map((destination) => (
          <article key={destination.id} className="destination-group">
          <div className="destination-tile" aria-label={`${destination.name}，${destination.city}`}>

            <img src={destination.image} alt={destination.imageAlt} />
            <span className="destination-shade" />
            <span className="destination-copy">
              <span className="destination-country">{destination.name}</span>
              <span className="destination-city">{destination.city}</span>
            </span>
          </div>
          <div className="destination-plans" aria-label={`${destination.name}的计划`}>
            {catalog.filter((trip) => trip.destination === destination.id).sort((a, b) => a.number - b.number).map((trip) => (
              <Link key={trip.id} to={`/plans/${trip.id}`} className="card trip-card">
                <strong>计划 {trip.number}</strong>
                <span className="muted">{trip.plan ? `${trip.plan.start} → ${trip.plan.end}` : '待选择日期'}</span>
              </Link>
            ))}
            <button type="button" className="btn btn-ghost" disabled={catalog.filter((trip) => trip.destination === destination.id).length >= MAX_PLANS}
              onClick={() => add(destination.id as Destination)}>
              {catalog.filter((trip) => trip.destination === destination.id).length >= MAX_PLANS ? '已达 4 个计划上限' : '＋ 新增计划'}
            </button>
          </div>
          </article>
        ))}
      </div>
    </section>
  )
}
