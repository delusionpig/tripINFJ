import { Link, Outlet, useLocation } from 'react-router-dom'
import { usePlan } from '../lib/PlanContext'

const SYNC_TEXT = { loading: '同步中…', saving: '保存中…', saved: '已同步', error: '云端同步失败，仅保存在本地' }

// Auth is skipped for now: everyone enters as admin. Re-add Supabase auth here later.
export default function Layout() {
  const { editing, setEditing, sync } = usePlan()
  const location = useLocation()
  const isDestinationPage = location.pathname === '/'
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          tripINFJ
        </Link>
        {!isDestinationPage && (
          <div className="topbar-actions">
            <span className={sync === 'error' ? 'error' : 'muted'} role="status">
              {SYNC_TEXT[sync]}
            </span>
            <div className="mode-switch" role="group" aria-label="模式">
              <button type="button" aria-pressed={!editing} onClick={() => setEditing(false)}>
                浏览
              </button>
              <button type="button" aria-pressed={editing} onClick={() => setEditing(true)}>
                编辑
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="content">
        {!isDestinationPage && (
          <div className="destination-back-row">
            <Link to="/" className="btn btn-ghost">← 返回目的地</Link>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
