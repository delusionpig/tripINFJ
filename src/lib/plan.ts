// A candidate for an event (e.g. a restaurant for lunch). Images are public Storage URLs.
export type Place = { id: string; name: string; address: string; link: string; note: string; images: string[] }
// A day is 24 hours split into contiguous blocks; a block with span > 1 is a merged cell.
export type Block = { id: string; span: number; event: string; link: string; note: string; places: Place[] }
export type Plan = { start: string; end: string; days: Record<string, Block[]> }

const KEY = 'tripinfj.plan.v1'

const uid = () => Math.random().toString(36).slice(2, 10)
const pad = (n: number) => String(n).padStart(2, '0')

export const newBlock = (): Block => ({ id: uid(), span: 1, event: '', link: '', note: '', places: [] })
export const newPlace = (): Place => ({ id: uid(), name: '', address: '', link: '', note: '', images: [] })
export const emptyDay = (): Block[] => Array.from({ length: 24 }, () => newBlock())
export const isUrl = (s: string) => /^https?:\/\/\S+$/.test(s.trim())

export function dateRange(start: string, end: string): string[] {
  const out: string[] = []
  const last = Date.parse(`${end}T00:00:00Z`)
  for (let t = Date.parse(`${start}T00:00:00Z`); t <= last; t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10))
  }
  return out
}

// Days outside the new range are kept in storage so changing dates never loses data.
export function buildPlan(start: string, end: string, prev?: Plan): Plan {
  const days = { ...prev?.days }
  for (const d of dateRange(start, end)) days[d] ??= emptyDay()
  return { start, end, days }
}

export function timeLabel(blocks: Block[], i: number): string {
  const from = blocks.slice(0, i).reduce((s, b) => s + b.span, 0)
  return `${pad(from)}:00–${pad(from + blocks[i].span)}:00`
}

const join = (a: string, b: string, sep: string) => [a, b].filter(Boolean).join(sep)

export function mergeNext(blocks: Block[], i: number): Block[] {
  const a = blocks[i]
  const b = blocks[i + 1]
  if (!b) return blocks
  const merged: Block = {
    id: a.id,
    span: a.span + b.span,
    event: join(a.event, b.event, ' / '),
    link: join(a.link, b.link, ' '),
    note: join(a.note, b.note, ' / '),
    places: [...a.places, ...b.places],
  }
  return [...blocks.slice(0, i), merged, ...blocks.slice(i + 2)]
}

// Splits the last hour off a merged block.
export function split(blocks: Block[], i: number): Block[] {
  const a = blocks[i]
  if (a.span <= 1) return blocks
  return [...blocks.slice(0, i), { ...a, span: a.span - 1 }, newBlock(), ...blocks.slice(i + 1)]
}

const isValid = (p: Plan) =>
  typeof p?.start === 'string' &&
  typeof p?.end === 'string' &&
  Object.values(p.days ?? {}).every(
    (b) => Array.isArray(b) && b.reduce((s, x) => s + x.span, 0) === 24,
  )

// Plans saved before ids/places existed get them filled in. Legacy ids are derived from
// date + start hour (not random) so a detail-page URL stays valid across reloads.
export function normalize(p: Plan | null): Plan | null {
  if (!p || !isValid(p)) return null
  const days = Object.fromEntries(
    Object.entries(p.days).map(([d, bs]) => {
      let hour = 0
      return [
        d,
        bs.map((b) => {
          const id = b.id ?? `${d}@${hour}`
          hour += b.span
          return { ...b, id, places: b.places ?? [] }
        }),
      ]
    }),
  )
  return { ...p, days }
}

export function loadPlan(id = 'main'): Plan | null {
  try {
    return normalize(JSON.parse(localStorage.getItem(`${KEY}.${id}`) ?? 'null') as Plan | null)
  } catch {
    return null
  }
}

export function savePlan(plan: Plan, id = 'main') {
  try {
    localStorage.setItem(`${KEY}.${id}`, JSON.stringify(plan))
  } catch {
    // storage full or blocked: keep working in memory
  }
}
