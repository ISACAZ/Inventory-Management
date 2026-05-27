import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Inventory    from './pages/Inventory'
import ItemDetail   from './pages/ItemDetail'
import QRScanner    from './pages/QRScanner'
import BorrowReturn from './pages/BorrowReturn'
import Locations    from './pages/Locations'
import Recommendations from './pages/Recommendations'
import Leaderboard  from './pages/Leaderboard'
import Statistics   from './pages/Statistics'
import Reports      from './pages/Reports'
import Admin        from './pages/Admin'
import Settings     from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/inventory"       element={<Inventory />} />
          <Route path="/inventory/:id"   element={<ItemDetail />} />
          <Route path="/qr-scanner"      element={<QRScanner />} />
          <Route path="/borrow-return"   element={<BorrowReturn />} />
          <Route path="/locations"       element={<Locations />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/leaderboard"     element={<Leaderboard />} />
          <Route path="/statistics"      element={<Statistics />} />
          <Route path="/reports"         element={<Reports />} />
          <Route path="/admin"           element={<Admin />} />
          <Route path="/settings"        element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
