import { createBrowserRouter } from 'react-router-dom'
import { Agenda } from '../pages/Home/Agenda'
import Home from '../pages/Home'
import Checkout from '../pages/Checkout'
import Success from '../pages/Success'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminLogin from '../pages/Admin/Login'
import { Terms } from '../pages/Legal/Terms'
import { Privacy } from '../pages/Legal/Privacy'
import Flona12km from '../pages/Flona12km'

/**
 * Maestro das Rotas 🎼
 * 
 * Agora com suporte a Multi-Eventos:
 * Rota '/' exibe a Agenda de Eventos.
 * Rota '/evento/:slug' renderiza a Landing Page específica daquele evento.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Agenda />,
  },
  {
    path: '/evento/:slug',
    element: <Home />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    // 🌿 Funil/Checkout da Trilha Flona 12km
    // URL limpa e direta para divulgar no Instagram/WhatsApp
    path: '/flona-12km',
    element: <Flona12km />,
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

