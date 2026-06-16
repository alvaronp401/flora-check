import { createBrowserRouter } from 'react-router-dom'
import { ScrollToTop } from '../components/ScrollToTop'
import { Agenda } from '../pages/Home/Agenda'
import Home from '../pages/Home'
import Checkout from '../pages/Checkout'
import Success from '../pages/Success'
import AdminDashboard from '../pages/Admin/Dashboard'
import AdminLogin from '../pages/Admin/Login'
import { Terms } from '../pages/Legal/Terms'
import { Privacy } from '../pages/Legal/Privacy'
import Flona12km from '../pages/Flona12km'

export const router = createBrowserRouter([
  {
    element: <ScrollToTop />,
    children: [
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
        path: '/flona-12km',
        element: <Flona12km />,
      },
      {
        path: '/success',
        element: <Success />,
      },
      {
        path: '/organizacao',
        element: <AdminLogin />,
      },
      {
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
    ],
  },
])
