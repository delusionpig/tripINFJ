import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { PlanProvider } from './lib/PlanContext'
import DetailPage from './pages/DetailPage'
import PlanPage from './pages/PlanPage'

export default function App() {
  return (
    <PlanProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PlanPage />} />
          <Route path="day/:date/:id" element={<DetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PlanProvider>
  )
}
