// A day is 24 hours split into contiguous blocks; a block with span > 1 is a merged cell.
export type Block = { span: number; event: string; link: string; note: string }
export type Plan = { start: string; end: string; days: Record<string, Block[]> }

const KEY = 'tripinfj.plan.v1'

export const emptyDay = (): Block[] =>
  Array.from({ length: 24 }, () => ({ span: 1, event: '', link: '', note: '' }))

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

const join = (a: string, b: string, sep: string) => [a, b].filter(Boolean).join(sep)

export function mergeNext(blocks: Block[], i: number): Block[] {
  const a = blocks[i]
  const b = blocks[i + 1]
  if (!b) return blocks
  const merged: Block = {
    span: a.span + b.span,
    event: join(a.event, b.event, ' / '),
    link: join(a.link, b.link, ' '),
    note: join(a.note, b.note, ' / '),
  }
  return [...blocks.slice(0, i), merged, ...blocks.slice(i + 2)]
}

// Splits the last hour off a merged block.
export function split(blocks: Block[], i: number): Block[] {
  const a = blocks[i]
  if (a.span <= 1) return blocks
  return [
    ...blocks.slice(0, i),
    { ...a, span: a.span - 1 },
    { span: 1, event: '', link: '', note: '' },
    ...blocks.slice(i + 1),
  ]
}

export const isValid = (p: Plan) =>
  typeof p?.start === 'string' &&
  typeof p?.end === 'string' &&
  Object.values(p.days ?? {}).every(
    (b) => Array.isArray(b) && b.reduce((s, x) => s + x.span, 0) === 24,
  )

export function loadPlan(): Plan | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Plan | null
    return p && isValid(p) ? p : null
  } catch {
    return null
  }
}

export function savePlan(plan: Plan) {
  try {
    localStorage.setItem(KEY, JSON.stringify(plan))
  } catch {
    // storage full or blocked: keep working in memory
  }
}
