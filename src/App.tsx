import { Routes, Route, Navigate } from 'react-router-dom'
import { ClientAuthProvider, useClientAuth } from './contexts/ClientAuthContext'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import ClientHome from './pages/client/Home'
import PhoneScreen from './pages/client/PhoneScreen'
import RegisterScreen from './pages/client/RegisterScreen'
import LoyaltyScreen from './pages/client/LoyaltyScreen'
import Step1Service from './pages/client/book/Step1Service'
import Step2DateTime from './pages/client/book/Step2DateTime'
import Step3Confirm from './pages/client/book/Step3Confirm'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminServices from './pages/admin/AdminServices'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminClients from './pages/admin/AdminClients'
import AppointmentsScreen from './pages/client/AppointmentsScreen'
import ProfileScreen from './pages/client/ProfileScreen'

export default function App() {
  return (
    <ClientAuthProvider>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </ClientAuthProvider>
  )
}

function AppRoutes() {
  const { admin } = useAdminAuth()
  const { client, loading } = useClientAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-barber-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-barber-gold/30 border-t-barber-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Admin */}
      <Route path="/admin/login" element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
      <Route path="/admin/dashboard" element={admin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/servicios" element={admin ? <AdminServices /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/horarios" element={admin ? <AdminSchedule /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/clientes" element={admin ? <AdminClients /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

      {/* Client */}
      <Route path="/telefono" element={<PhoneScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />
      <Route path="/agendar" element={client ? <Step1Service /> : <Navigate to="/telefono" replace />} />
      <Route path="/agendar/fecha" element={client ? <Step2DateTime /> : <Navigate to="/telefono" replace />} />
      <Route path="/agendar/confirmar" element={client ? <Step3Confirm /> : <Navigate to="/telefono" replace />} />
      <Route path="/citas" element={client ? <AppointmentsScreen /> : <Navigate to="/telefono" replace />} />
      <Route path="/perfil" element={client ? <ProfileScreen /> : <Navigate to="/telefono" replace />} />
      <Route path="/puntos" element={client ? <LoyaltyScreen /> : <Navigate to="/telefono" replace />} />
      <Route path="/" element={client ? <ClientHome /> : <Navigate to="/telefono" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
