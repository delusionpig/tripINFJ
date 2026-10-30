import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setInfo('')
    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) return setError(error.message)
    if (mode === 'signup' && !data.session) setInfo('注册成功，请前往邮箱完成验证后登录。')
  }

  return (
    <main className="center-screen">
      <form className="card form" onSubmit={onSubmit}>
        <h1>tripINFJ</h1>
        <p className="muted">{mode === 'signin' ? '登录以管理你的旅行计划' : '创建账号开始规划'}</p>
        <label>
          邮箱
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          密码
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        {info && <p role="status" className="muted">{info}</p>}
        <button type="submit" className="btn" disabled={busy}>
          {mode === 'signin' ? '登录' : '注册'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </form>
    </main>
  )
}
