import React from 'react'
import { MarqueeBanner } from './components/MarqueeBanner'
import { Hero } from './components/Hero'
import { Schedule } from './components/Schedule'
import { Kit } from './components/Kit'
import { FooterCTA } from './components/FooterCTA'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Urgência */}
      <MarqueeBanner />

      {/* Seção Principal (CTA & Logo) */}
      <Hero />

      {/* Programação do Evento */}
      <Schedule />

      {/* Seção de Kit & Atributos Técnicos */}
      <Kit />

      {/* Rodapé & Chamada Final */}
      <FooterCTA />
    </div>
  )
}

export default Home
