import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ItemDetail from "./pages/ItemDetail";
import BorrowReturn from "./pages/BorrowReturn";
import QrScanner from "./pages/QrScanner";
import Locations from "./pages/Locations";
import Analytics from "./pages/Analytics";
import Maintenance from "./pages/Maintenance";
import Recommendations from "./pages/Recommendations";
import Leaderboard from "./pages/Leaderboard";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/:id" element={<ItemDetail />} />
        <Route path="/borrow" element={<BorrowReturn />} />
        <Route path="/qr-scanner" element={<QrScanner />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
