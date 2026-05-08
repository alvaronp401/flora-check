import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Checkout from '../pages/Checkout'
import Success from '../pages/Success'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminLogin from '../pages/Admin/Login'
import { Terms } from '../pages/Legal/Terms'
import { Privacy } from '../pages/Legal/Privacy'

/**
 * Maestro das Rotas 🎼
 * 
 * Agora com Camuflagem 'Stealth' e Login Blindado. 🛡️🔐
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/success',
    element: <Success />,
  },
  {
    // 🕵️ Rota Camuflada de Manutenção / Login
    path: '/organizacao',
    element: <AdminLogin />,
  },
  {
    // 🏰 Portal do Comandante (Protegido por Double-Lock)
    path: '/portal-flona',
    element: <AdminDashboard />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
])
