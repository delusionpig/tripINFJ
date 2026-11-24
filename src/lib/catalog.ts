import { bangkokPlan } from './bangkok.ts'
import { dateRange, loadPlan, normalize, type Plan } from './plan.ts'

export type Destination = 'japan' | 'thailand'
export type Trip = { id: string; destination: Destination; number: number; plan: Plan | null }
export type Catalog = Trip[]
export const CATALOG_KEY = 'tripinfj.catalog.v1'
export const MAX_PLANS = 4

export function initialCatalog(): Catalog {
  return [
    { id: 'main', destination: 'japan', number: 1, plan: loadPlan('main') },
    { id: 'bangkok', destination: 'thailand', number: 1, plan: loadPlan('bangkok') ?? bangkokPlan },
  ]
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
    if (!trip || typeof trip.id !== 'string' || ids.has(trip.id) || !['japan', 'thailand'].includes(trip.destination) ||
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
