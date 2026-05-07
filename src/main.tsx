import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/index.tsx'
import './index.css'

/**
 * O Coração da Aplicação ❤️
 * 
 * Em vez de renderizar um componente <App /> fixo, agora renderizamos o <RouterProvider />.
 * Ele é o provedor que entrega toda a inteligência das rotas para o resto do app.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
