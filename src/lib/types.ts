export type Trip = {
  id: string
  user_id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export type TripInput = Pick<Trip, 'title' | 'destination' | 'start_date' | 'end_date' | 'notes'>
