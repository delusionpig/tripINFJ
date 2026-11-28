import { bangkokPlan } from './bangkok.ts'
import { dateRange, loadPlan, normalize, type Plan } from './plan.ts'

export type Destination = 'japan' | 'thailand' | 'singapore' | 'malaysia'
export type Trip = { id: string; destination: Destination; number: number; plan: Plan | null }
export type Catalog = Trip[]
export const CATALOG_KEY = 'tripinfj.catalog.v1'
export const MAX_PLANS = 4

const samplePlan = (start: string, agenda: string[][]): Plan => {
  const days: Plan['days'] = {}
  agenda.forEach((items, offset) => {
    const date = dateRange(start, start)[0].slice(0, 8) + String(Number(start.slice(8)) + offset).padStart(2, '0')
    const events = [
      ['08:00', '10:00', items[0]], ['10:00', '13:00', items[1]],
      ['13:00', '14:00', '午餐 / 休息'], ['14:00', '17:00', items[2]],
      ['17:00', '19:00', items[3]], ['19:00', '21:00', '晚餐'],
    ]
    const blocks = Array.from({ length: 24 }, (_, hour) => ({ id: `${date}@${hour}`, span: 1, event: '', link: '', note: '', places: [] as [] }))
    for (const [from, to, event] of events) {
      const begin = Number(from.slice(0, 2)), finish = Number(to.slice(0, 2))
      blocks[begin] = { ...blocks[begin], span: finish - begin, event, note: '建议时间为暂定安排；营业时间、票务及交通请出发前确认。' }
      for (let h = begin + 1; h < finish; h++) blocks[h].span = 0
    }
    days[date] = blocks.filter((block) => block.span > 0)
  })
  return { start, end: dateRange(start, start)[0].slice(0, 8) + String(Number(start.slice(8)) + agenda.length - 1).padStart(2, '0'), days }
}

const singaporePlan = samplePlan('2026-12-14', [
  ['Breakfast and travel to Sentosa', 'Universal Studios Singapore: arrive at opening, explore themed zones and rides', 'Continue USS attractions, shows and evening activities', 'Return from Sentosa and rest'],
  ['Marina Bay Sands and waterfront walk', 'Gardens by the Bay: Flower Dome and Cloud Forest', 'Civic District and Singapore River city walk', 'Marina Bay promenade at sunset'],
])
const malaysiaPlan = samplePlan('2026-12-16', [
  ['Travel Singapore to Kuala Lumpur and hotel check-in', 'KLCC Park and Petronas Towers exterior', 'Suria KLCC and nearby walk', 'Dinner around Bukit Bintang'],
  ['Merdeka Square and Sultan Abdul Samad Building', 'Central Market and Petaling Street', 'Kuala Lumpur citywalk through Chinatown and heritage lanes', 'KL Tower area / evening skyline'],
])

export function initialCatalog(): Catalog {
  return [
    { id: 'main', destination: 'japan', number: 1, plan: loadPlan('main') },
    { id: 'bangkok', destination: 'thailand', number: 1, plan: loadPlan('bangkok') ?? bangkokPlan },
    { id: 'singapore', destination: 'singapore', number: 1, plan: singaporePlan },
    { id: 'malaysia', destination: 'malaysia', number: 1, plan: malaysiaPlan },
  ]
}

/** Add shipped starter trips only when that destination has no saved trip. */
export function mergeDefaultTrips(catalog: Catalog): Catalog {
  let result = catalog
  for (const starter of initialCatalog().filter((trip) => trip.destination === 'singapore' || trip.destination === 'malaysia')) {
    if (!result.some((trip) => trip.destination === starter.destination) && result.filter((trip) => trip.destination === starter.destination).length < MAX_PLANS) {
      result = [...result, { ...starter }]
    }
  }
  return result
}

export function addTrip(catalog: Catalog, destination: Destination, plan: Plan | null = null): Catalog {
  const trips = catalog.filter((trip) => trip.destination === destination)
  if (trips.length >= MAX_PLANS) throw new Error('每个目的地最多 4 个计划，请先删除一个计划。')
  const number = [1, 2, 3, 4].find((n) => !trips.some((trip) => trip.number === n))!
  return [...catalog, { id: crypto.randomUUID(), destination, number, plan }]
}

export const coversDates = (plan: Plan, start: string, end: string) => start <= plan.start && end >= plan.end

export function validCatalog(value: unknown): value is Catalog {
  if (!Array.isArray(value) || value.some((trip) => !trip || typeof trip !== 'object')) return false
  const ids = new Set<string>()
  return value.every((trip) => {
    if (!trip || typeof trip.id !== 'string' || ids.has(trip.id) || !['japan', 'thailand', 'singapore', 'malaysia'].includes(trip.destination) ||
      !Number.isInteger(trip.number) || trip.number < 1 || trip.number > 4 ||
      value.filter((other) => other.destination === trip.destination).length > MAX_PLANS ||
      value.filter((other) => other.destination === trip.destination && other.number === trip.number).length !== 1) return false
    ids.add(trip.id)
    if (trip.plan === null) return true
    if (typeof trip.plan?.start !== 'string' || typeof trip.plan?.end !== 'string' ||
      trip.plan.start > trip.plan.end || typeof trip.plan.days !== 'object' || trip.plan.days === null) return false
    try {
      const dates = dateRange(trip.plan.start, trip.plan.end)
      return dates.length > 0 && Boolean(normalize(trip.plan)) && dates.every((date) => Array.isArray(trip.plan.days[date]))
    } catch { return false }
  })
}
