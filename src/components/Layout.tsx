import { Link, Outlet } from 'react-router-dom'

// Auth is skipped for now: everyone enters as admin. Re-add Supabase auth here later.
export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          tripINFJ
        </Link>
        <span className="muted">管理员</span>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
