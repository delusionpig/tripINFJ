import { useNavigate } from 'react-router-dom'

const destinations = [
  {
    id: 'japan',
    name: '日本',
    city: '东京',
    image: 'https://images.unsplash.com/photo-1599173704727-28abef7425e1?auto=format&fit=crop&w=1600&q=85',
    imageAlt: '东京城市夜景',
    active: true,
  },
  {
    id: 'thailand',
    name: '泰国',
    city: '曼谷',
    image: 'https://images.unsplash.com/photo-1558847345-289a92f80ddb?auto=format&fit=crop&w=1600&q=85',
    imageAlt: '曼谷湄南河沿岸城市景色',
    active: true,
  },
]

export default function DestinationPage() {
  const navigate = useNavigate()
  return (
    <section className="destination-page">
      <header className="destination-heading">
        <p className="eyebrow">TRAVEL PLANS</p>
        <h1>选择目的地</h1>
      </header>
      <div className="destination-grid" aria-label="旅行目的地">
        {destinations.map((destination) => (
          <button
            key={destination.id}
            type="button"
            className="destination-tile"
            onClick={() => destination.active && navigate(destination.id === 'thailand' ? '/bangkok' : '/plan')}
            aria-label={`${destination.name}，${destination.city}，打开行程`}
          >
            <img src={destination.image} alt={destination.imageAlt} />
            <span className="destination-shade" />
            <span className="destination-copy">
              <span className="destination-country">{destination.name}</span>
              <span className="destination-city">{destination.city}</span>
              <span className="destination-action">查看行程 <span aria-hidden="true">→</span></span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
