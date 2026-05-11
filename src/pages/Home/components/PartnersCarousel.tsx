import React from 'react'
import parceiro1 from '../../../assets/parceiro1.png'
import parceiro2 from '../../../assets/parceiro2.png'
import parceiro3 from '../../../assets/parceiro3.png'
import parceiro4 from '../../../assets/parceiro4.png'
import parceiro5 from '../../../assets/parceiro5.png'
import parceiro6 from '../../../assets/parceiro6.png'
import parceiro7 from '../../../assets/parceiro7.png'
import parceiro8 from '../../../assets/parceiro8.png'

const partners = [
  { name: 'KORE', handle: '@kore.brasilia.aguasclaras', logo: parceiro1 },
  { name: 'Dr. Key', handle: '@drkeybsb', logo: parceiro2 },
  { name: 'Clínica Txai', handle: '@clinicatxai', logo: parceiro3 },
  { name: 'Corpo Regenerado', handle: '@corporegeneradooficial', logo: parceiro4 },
  { name: 'Fit Café Gourmet', handle: '@fitcafegourmet', logo: parceiro5 },
  { name: 'Ricca B. Coffee', handle: '@riccabcoffee', logo: parceiro6 },
  { name: 'Empório Naturelo', handle: '@emporionaturelo', logo: parceiro7 },
  { name: 'Felipe Alexandre', handle: '@lipeoalexandre.nutri', logo: parceiro8 },
]

export const PartnersCarousel: React.FC = () => {
  // Quadruplicamos a lista para criar o buffer necessário para o loop infinito de 25% (igual ao MarqueeBanner)
  const infinitePartners = [...partners, ...partners, ...partners, ...partners]

  return (
    <div className="w-full mt-16 overflow-hidden py-4 border-t border-slate-100/30">
      <h3 className="flex flex-col items-center text-xl md:text-3xl font-black uppercase tracking-[0.4em] text-[#D4B996] leading-none mb-10 text-center w-full pl-[0.4em]">
        <span>Nossos</span>
        <span>Parceiros</span>
      </h3>
      
      <div className="relative flex overflow-hidden w-full">
        {/* Sincronizado com MarqueeBanner: w-max, will-change-transform e backface-hidden para performance sênior */}
        <div className="flex w-max animate-marquee hover:pause will-change-transform backface-hidden whitespace-nowrap py-12">
          {infinitePartners.map((partner, i) => (
            <a 
              key={i} 
              href={`https://www.instagram.com/${partner.handle.replace('@', '')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-6 shrink-0 group cursor-pointer px-6 md:px-10"
            >
              {/* Bounding Box: Garantimos que todas as logos ocupem o mesmo espaço de importância */}
              <div className="h-16 md:h-24 w-40 md:w-64 flex items-center justify-center transition-all duration-700">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  loading="lazy"
                  className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out will-change-transform" 
                />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-blue-600 transition-colors italic">
                {partner.handle}
              </span>
            </a>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .animate-marquee {
          animation: marquee 19s linear infinite;
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}
