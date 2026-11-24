import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { PlanProvider } from './lib/PlanContext'
import DetailPage from './pages/DetailPage'
import DestinationPage from './pages/DestinationPage'
import PlanPage from './pages/PlanPage'

function PlanRoutes() {
  const location = useLocation()
  const match = location.pathname.match(/^\/plans\/([^/]+)/)
  const planId = match ? decodeURIComponent(match[1]) : location.pathname.startsWith('/bangkok') ? 'bangkok' : 'main'
  return (
    <PlanProvider planId={planId}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DestinationPage />} />
          <Route path="/plans/:planId" element={<PlanPage key={planId} />} />
          <Route path="/plans/:planId/day/:date/:id" element={<DetailPage />} />
          <Route path="/plan" element={<PlanPage key={planId} />} />
          <Route path="/bangkok" element={<PlanPage />} />
          <Route path="/day/:date/:id" element={<DetailPage />} />
          <Route path="/bangkok/day/:date/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </PlanProvider>
  )
}

export default function App() {
  return <PlanRoutes />
}
