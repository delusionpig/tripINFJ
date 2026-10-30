import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import PlanPage from './pages/PlanPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PlanPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
