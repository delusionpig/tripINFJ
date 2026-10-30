import { supabase } from './supabase'
import type { Trip, TripInput } from './types'

export async function listTrips() {
  const { data, error } = await supabase.from('trips').select('*').order('start_date', { ascending: true })
  if (error) throw error
  return data as Trip[]
}

export async function getTrip(id: string) {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
  if (error) throw error
  return data as Trip
}

export async function createTrip(input: TripInput) {
  const { data, error } = await supabase.from('trips').insert(input).select().single()
  if (error) throw error
  return data as Trip
}

export async function updateTrip(id: string, input: TripInput) {
  const { data, error } = await supabase.from('trips').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Trip
}
