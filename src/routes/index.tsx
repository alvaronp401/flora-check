import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Checkout from '../pages/Checkout'
import Success from '../pages/Success'
import { Terms } from '../pages/Legal/Terms'
import { Privacy } from '../pages/Legal/Privacy'

/**
 * Maestro das Rotas 🎼
 * 
 * Aqui definimos quem é quem na nossa aplicação. 
 * O 'path' é o que aparece na URL, e o 'element' é o componente que o React vai renderizar.
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
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
])
