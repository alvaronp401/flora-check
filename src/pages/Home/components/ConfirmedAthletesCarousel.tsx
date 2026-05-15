import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config/api';

export const ConfirmedAthletesCarousel: React.FC = () => {
  const [athletes, setAthletes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/confirmed-athletes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAthletes(data);
        } else {
          setAthletes(['Em Breve', 'Garanta sua vaga']);
        }
      })
      .catch((err) => console.error('Erro ao buscar atletas:', err));
  }, []);

  if (athletes.length === 0) return null;

  return (
    <div className="w-full overflow-hidden flex flex-col items-center">
      <h3 className="text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-[#D4B996] mb-8 text-center w-full">
        Atletas Confirmados
      </h3>
      
      {/* 
        Container Horizontal com fade nas laterais usando máscara de gradiente 
        Agora ele ocupa toda a largura da tela (w-full)
      */}
      <div className="relative w-full max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        
        {/* A div que vai transladar horizontalmente */}
        <div className="flex w-max animate-marquee-horizontal hover:pause will-change-transform items-center py-4">
          {/* Quadruplicamos a lista para criar a ilusão de rolagem infinita sem "pular" */}
          {[...athletes, ...athletes, ...athletes, ...athletes].map((name, i) => (
            <div key={i} className="flex items-center mx-3 shrink-0">
              <span className="text-sm md:text-base font-black text-slate-800 uppercase tracking-widest px-8 py-4 bg-white rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-105 whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Animação horizontal */
        @keyframes marquee-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); } /* Transladar 25% porque quadruplicamos o array */
        }
        .animate-marquee-horizontal {
          /* Velocidade muito mais rápida, pedida pelo usuário: 12s */
          animation: marquee-horizontal 12s linear infinite; 
        }
        .pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
