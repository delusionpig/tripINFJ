import { supabase } from './supabase'
import { normalize, type Plan } from './plan'

// Single-user version: one fixed row holds the whole plan.
const DEFAULT_ID = 'main'

export async function fetchPlan(id = DEFAULT_ID): Promise<Plan | null> {
  const { data, error } = await supabase.from('trip_plans').select('data').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? normalize(data.data as Plan) : null
}

export async function pushPlan(plan: Plan, id = DEFAULT_ID) {
  const { error } = await supabase
    .from('trip_plans')
    .upsert({ id, data: plan, updated_at: new Date().toISOString() })
  if (error) throw error
}
