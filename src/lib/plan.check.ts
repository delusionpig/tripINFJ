import { buildPlan, dateRange, emptyDay, mergeNext, split } from './plan.ts'
import { planWorkbook } from './planExcel.ts'
import { addTrip, coversDates, validCatalog, type Catalog } from './catalog.ts'

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

p2.days['2026-10-30'] = merged
const workbook = await planWorkbook(p2).toBlob()
const signature = new Uint8Array(await workbook.slice(0, 4).arrayBuffer())
ok(signature.join() === '80,75,3,4', 'Excel export produces a ZIP workbook')

ok(coversDates(p2, '2026-10-29', '2026-11-02'), 'extension keeps original dates')
ok(coversDates(p2, p2.start, p2.end), 'unchanged dates keep plan')
ok(!coversDates(p2, '2026-10-31', '2026-11-02'), 'shift requires a new plan')
ok(!coversDates(p2, '2026-10-30', '2026-10-30'), 'shortening requires a new plan')
let catalog: Catalog = []
for (let i = 0; i < 4; i++) catalog = addTrip(catalog, 'japan', p2)
ok(validCatalog(catalog), 'four plans form a valid catalog')
let blocked = false
try { addTrip(catalog, 'japan') } catch { blocked = true }
ok(blocked, 'fifth plan rejected')
const deleted = catalog[1].id
catalog = catalog.filter((trip) => trip.id !== deleted)
catalog = addTrip(catalog, 'japan')
ok(catalog.length === 4 && !catalog.some((trip) => trip.id === deleted), 'deletion frees slot without resurrecting plan')
catalog = addTrip(catalog, 'thailand')
ok(validCatalog(catalog), 'destinations have independent limits')
ok(!validCatalog([...catalog, catalog[0]]), 'duplicate plans rejected')

console.log('plan checks passed')
