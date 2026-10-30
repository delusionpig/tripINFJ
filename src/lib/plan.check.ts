import { buildPlan, dateRange, emptyDay, mergeNext, split } from './plan.ts'

// Run: npm run check
const ok = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`FAIL: ${msg}`)
}
const total = (b: { span: number }[]) => b.reduce((s, x) => s + x.span, 0)

ok(dateRange('2026-10-30', '2026-11-01').join() === '2026-10-30,2026-10-31,2026-11-01', 'dateRange crosses month')
ok(dateRange('2026-10-30', '2026-10-30').length === 1, 'single day')

const day = emptyDay()
day[2].event = 'a'
day[3].event = 'b'
const merged = mergeNext(day, 2)
ok(merged.length === 23 && merged[2].span === 2 && total(merged) === 24, 'merge keeps 24h')
ok(merged[2].event === 'a / b', 'merge keeps text')
ok(mergeNext(merged, 22) === merged, 'merge last is no-op')

const back = split(merged, 2)
ok(back.length === 24 && total(back) === 24 && back[2].event === 'a / b', 'split restores 24 blocks')
ok(split(back, 0) === back, 'split span 1 is no-op')

const p1 = buildPlan('2026-10-30', '2026-11-01')
p1.days['2026-11-01'][0].event = 'keep'
const p2 = buildPlan('2026-10-30', '2026-10-31', p1)
ok(p2.days['2026-11-01'][0].event === 'keep', 'shrinking range keeps data')

console.log('plan checks passed')
