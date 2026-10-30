import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <main className="center-screen">加载中…</main>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
