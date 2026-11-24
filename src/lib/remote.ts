import { supabase } from './supabase'
import { normalize, type Plan } from './plan'
import { validCatalog, type Catalog } from './catalog'

const CATALOG_ID = 'catalog.v1'

export async function fetchCatalog(): Promise<Catalog | null> {
  const { data, error } = await supabase.from('trip_plans').select('data').eq('id', CATALOG_ID).maybeSingle()
  if (error) throw error
  if (!data) return null
  if (!validCatalog(data.data)) throw new Error('云端计划列表格式无效')
  return data.data.map((trip) => {
    const plan = trip.plan === null ? null : normalize(trip.plan)
    if (trip.plan !== null && !plan) throw new Error('云端计划格式无效')
    return { ...trip, plan }
  })
}

export async function pushCatalog(catalog: Catalog) {
  const { error } = await supabase.from('trip_plans').upsert({
    id: CATALOG_ID, data: catalog, updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

// Legacy rows are read once when migrating to the multi-plan catalog.
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
