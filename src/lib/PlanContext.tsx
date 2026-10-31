import {
  createContext, useContext, useEffect, useRef, useState,
  type Dispatch, type ReactNode,
} from 'react'
import { fetchPlan, pushPlan } from './remote'
import { loadPlan, savePlan, type Plan } from './plan'
import { bangkokPlan } from './bangkok'

export type Sync = 'loading' | 'saving' | 'saved' | 'error'
type Ctx = {
  plan: Plan | null
  update: Dispatch<React.SetStateAction<Plan | null>>
  sync: Sync
  editing: boolean
  setEditing: (v: boolean) => void
}

const PlanCtx = createContext<Ctx | null>(null)

export function PlanProvider({ children, planId = 'main' }: { children: ReactNode; planId?: string }) {
  const isBangkok = planId.startsWith('bangkok')
  const initial = isBangkok ? bangkokPlan : null
  const [plan, setPlan] = useState<Plan | null>(() => isBangkok ? initial : loadPlan(planId))
  const [editing, setEditing] = useState(false)
  const [sync, setSync] = useState<Sync>('loading')
  const [ready, setReady] = useState(false)
  const edited = useRef(false)

  useEffect(() => {
    setReady(false)
    edited.current = false
    setPlan(isBangkok ? bangkokPlan : loadPlan(planId))
    fetchPlan(planId)
      .then((remote) => {
        if (isBangkok) {
          setPlan(bangkokPlan)
          if (!remote) pushPlan(bangkokPlan, planId).catch(() => setSync('error'))
        } else if (remote) setPlan(remote)
        setReady(true)
        setSync('saved')
      })
      .catch(() => setSync('error'))
  }, [planId])

  useEffect(() => {
    if (!plan) return
    savePlan(plan, planId)
    if (!ready || !edited.current) return
    setSync('saving')
    const t = setTimeout(() => {
      pushPlan(plan, planId)
        .then(() => setSync('saved'))
        .catch(() => setSync('error'))
    }, 800)
    return () => clearTimeout(t)
  }, [plan, ready, planId])

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
