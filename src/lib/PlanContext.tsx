import {
  createContext, useContext, useEffect, useRef, useState,
  type Dispatch, type ReactNode, type SetStateAction,
} from 'react'
import { fetchPlan, pushPlan } from './remote'
import { loadPlan, savePlan, type Plan } from './plan'

export type Sync = 'loading' | 'saving' | 'saved' | 'error'
type Ctx = {
  plan: Plan | null
  update: Dispatch<SetStateAction<Plan | null>>
  sync: Sync
  editing: boolean
  setEditing: (v: boolean) => void
}

const PlanCtx = createContext<Ctx | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan | null>(loadPlan)
  const [editing, setEditing] = useState(false)
  const [sync, setSync] = useState<Sync>('loading')
  const [ready, setReady] = useState(false)
  const edited = useRef(false)

  // Cloud is the source of truth once it loads; until then (or if it fails) local data is used.
  useEffect(() => {
    fetchPlan()
      .then((remote) => {
        if (remote) setPlan(remote)
        setReady(true)
        setSync('saved')
      })
      .catch(() => setSync('error'))
  }, [])

  // Local mirror always; cloud only after the first fetch succeeded (a failed load must not
  // overwrite cloud data) and only for changes the user made (browsing never writes).
  useEffect(() => {
    if (!plan) return
    savePlan(plan)
    if (!ready || !edited.current) return
    setSync('saving')
    const t = setTimeout(() => {
      pushPlan(plan)
        .then(() => setSync('saved'))
        .catch(() => setSync('error'))
    }, 800)
    return () => clearTimeout(t)
  }, [plan, ready])

  const update: Ctx['update'] = (next) => {
    edited.current = true
    setPlan(next)
  }

  return <PlanCtx.Provider value={{ plan, update, sync, editing, setEditing }}>{children}</PlanCtx.Provider>
}

export function usePlan() {
  const c = useContext(PlanCtx)
  if (!c) throw new Error('usePlan must be used inside PlanProvider')
  return c
}
