import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react'
import { fetchCatalog, fetchPlan, pushCatalog } from './remote'
import { normalize, type Plan } from './plan'
import { addTrip, CATALOG_KEY, initialCatalog, mergeDefaultTrips, validCatalog, type Catalog, type Destination } from './catalog'

export type Sync = 'loading' | 'saving' | 'saved' | 'error'
type Ctx = {
  catalog: Catalog
  plan: Plan | null
  planId: string
  planPath: string
  update: Dispatch<React.SetStateAction<Plan | null>>
  create: (destination: Destination, plan?: Plan | null) => string
  remove: () => void
  sync: Sync
  editing: boolean
  setEditing: (v: boolean) => void
}

const PlanCtx = createContext<Ctx | null>(null)
function loadCatalog() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CATALOG_KEY) ?? 'null')
    if (validCatalog(value)) {
      const result = value.map((trip) => ({ ...trip, plan: trip.plan === null ? null : normalize(trip.plan) }))
      if (value.every((trip, i) => trip.plan === null || result[i].plan !== null)) return mergeDefaultTrips(result)
    }
  } catch { /* Fall back to existing single-plan storage. */ }
  return initialCatalog()
}

export function PlanProvider({ children, planId = 'main' }: { children: ReactNode; planId?: string }) {
  const [catalog, setCatalog] = useState<Catalog>(loadCatalog)
  const current = useRef(catalog)
  const revision = useRef(0)
  const writes = useRef<Promise<void>>(Promise.resolve())
  const pending = useRef(false)
  const [loadedPending] = useState(() => {
    try { return localStorage.getItem(`${CATALOG_KEY}.pending`) === 'true' } catch { return false }
  })
  const [sync, setSync] = useState<Sync>('loading')
  const [ready, setReady] = useState(false)
  const [editing, setEditing] = useState(false)
  const [storageError, setStorageError] = useState(false)

  const store = (next: Catalog, dirty: boolean) => {
    current.current = next
    pending.current = dirty
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(next))
      localStorage.setItem(`${CATALOG_KEY}.pending`, String(dirty))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
    setCatalog(next)
  }

  useEffect(() => {
    let canceled = false
    pending.current ||= loadedPending
    const version = revision.current
    fetchCatalog().then(async (remote) => {
      if (!remote) {
        const [main, bangkok] = await Promise.all([fetchPlan('main'), fetchPlan('bangkok')])
        if (canceled) return
        if (!pending.current && revision.current === version) {
          store(mergeDefaultTrips(current.current.map((trip) => ({ ...trip,
            plan: trip.id === 'main' ? main ?? trip.plan : trip.id === 'bangkok' ? bangkok ?? trip.plan : trip.plan,
          }))), true)
        } else pending.current = true
      } else {
        if (canceled) return
        if (!pending.current && revision.current === version) {
          const merged = mergeDefaultTrips(remote)
          store(merged, merged.length !== remote.length)
        }
      }
      if (!canceled) {
        setReady(true)
        setSync(pending.current ? 'saving' : 'saved')
      }
    }).catch(() => { if (!canceled) setSync('error') })
    return () => { canceled = true }
  }, [])

  // Serialize writes so a slower earlier edit cannot resurrect a deleted plan.
  useEffect(() => {
    if (!ready || !pending.current) return
    let canceled = false
    let timer: ReturnType<typeof setTimeout>
    const save = async () => {
      const version = revision.current
      const snapshot = current.current
      setSync('saving')
      try {
        const write = writes.current.catch(() => {}).then(() => pushCatalog(snapshot))
        writes.current = write
        await write
        if (canceled) return
        if (version !== revision.current) { timer = setTimeout(save, 800); return }
        pending.current = false
        localStorage.setItem(`${CATALOG_KEY}.pending`, 'false')
        setSync('saved')
      } catch { if (!canceled) setSync('error') }
    }
    timer = setTimeout(save, 800)
    return () => { canceled = true; clearTimeout(timer) }
  }, [ready, catalog])

  useEffect(() => { setEditing(false) }, [planId])

  const change = (next: Catalog) => {
    revision.current += 1
    store(next, true)
    setSync(ready ? 'saving' : 'error')
  }
  const plan = catalog.find((trip) => trip.id === planId)?.plan ?? null
  const update: Ctx['update'] = (next) => {
    const trip = current.current.find((item) => item.id === planId)
    if (!trip) return
    const value = typeof next === 'function' ? next(trip.plan) : next
    change(current.current.map((item) => item.id === planId ? { ...item, plan: value } : item))
  }
  const create: Ctx['create'] = (destination, value = null) => {
    const next = addTrip(current.current, destination, value)
    change(next)
    return next[next.length - 1].id
  }
  const remove = () => change(current.current.filter((trip) => trip.id !== planId))
  const planPath = `/plans/${encodeURIComponent(planId)}`
  return (
    <PlanCtx.Provider value={{ catalog, plan, planId, planPath, update, create, remove,
      sync: storageError ? 'error' : sync, editing, setEditing }}>
      {children}
    </PlanCtx.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanCtx)
  if (!context) throw new Error('usePlan must be used inside PlanProvider')
  return context
}
