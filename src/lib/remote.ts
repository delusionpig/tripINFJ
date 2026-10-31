import { supabase } from './supabase'
import { normalize, type Plan } from './plan'

// Single-user version: one fixed row holds the whole plan.
const ID = 'main'

export async function fetchPlan(): Promise<Plan | null> {
  const { data, error } = await supabase.from('trip_plans').select('data').eq('id', ID).maybeSingle()
  if (error) throw error
  return data ? normalize(data.data as Plan) : null
}

export async function pushPlan(plan: Plan) {
  const { error } = await supabase
    .from('trip_plans')
    .upsert({ id: ID, data: plan, updated_at: new Date().toISOString() })
  if (error) throw error
}
